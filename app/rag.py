"""Hybrid retrieval: dense embeddings (Ollama) + BM25 (SQLite FTS5), fused with RRF."""
from __future__ import annotations

import asyncio
import sys

import httpx
import numpy as np

from .config import EMBED_DIM, EMBED_MODEL, EMBED_PROVIDER, OLLAMA_URL
from .db import db
from .ingest import fts_tokens


async def _ollama_embed(texts: list[str]) -> list[list[float]]:
    payload_texts = [(t or " ")[:4000] for t in texts]
    out: list[list[float]] = []
    timeout = httpx.Timeout(180.0, connect=10.0, read=180.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        for i in range(0, len(payload_texts), 24):
            batch = payload_texts[i : i + 24]
            resp = await client.post(
                f"{OLLAMA_URL}/api/embed",
                json={"model": EMBED_MODEL, "input": batch},
            )
            resp.raise_for_status()
            data = resp.json()
            embeddings = data.get("embeddings")
            if embeddings is None:  # older API shape
                embeddings = [data.get("embedding", [])]
            out.extend(embeddings)
    return out


async def embed_texts(texts: list[str]) -> list[list[float] | None]:
    """Embed a batch. Returns None per item if embedding is disabled/failed."""
    if EMBED_PROVIDER != "ollama" or not texts:
        return [None] * len(texts)
    for attempt in range(2):
        try:
            vectors = await _ollama_embed(texts)
            if len(vectors) != len(texts):
                raise ValueError("embedding count mismatch")
            return [list(map(float, v)) for v in vectors]
        except Exception as exc:  # noqa: BLE001
            if attempt == 0:
                await asyncio.sleep(0.8)
                continue
            print(f"[rag] embedding failed: {exc}", file=sys.stderr)
            return [None] * len(texts)
    return [None] * len(texts)


def _doc_filter(doc_ids: list[str] | None) -> tuple[str, list]:
    if doc_ids:
        placeholders = ",".join("?" for _ in doc_ids)
        return f" AND c.doc_id IN ({placeholders})", list(doc_ids)
    return "", []


def _load_rows(doc_ids: list[str] | None) -> list[dict]:
    where, params = _doc_filter(doc_ids)
    sql = f"""SELECT c.id, c.doc_id, c.page, c.idx, c.text, c.embedding, d.title
              FROM chunks c JOIN documents d ON d.id = c.doc_id
              WHERE d.status = 'ready'{where}"""
    with db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return [dict(r) for r in rows]


def _sparse_search(query: str, doc_ids: list[str] | None, limit: int = 40) -> list[str]:
    tokens = list(dict.fromkeys(fts_tokens(query, 30)))
    terms = [t for t in tokens if len(t) >= 2 or CJK_SINGLE(t)]
    if not terms:
        return []
    match = " OR ".join(f'"{t}"' for t in terms[:20])
    where, params = _doc_filter(doc_ids)
    sql = f"""SELECT chunk_id FROM chunks_fts
              WHERE chunks_fts MATCH ?{where.replace('c.doc_id', 'doc_id')}
              ORDER BY bm25(chunks_fts) LIMIT ?"""
    try:
        with db() as conn:
            rows = conn.execute(sql, [match, *params, limit]).fetchall()
        return [r["chunk_id"] for r in rows]
    except Exception as exc:  # noqa: BLE001 — never let search syntax kill a request
        print(f"[rag] fts error: {exc}", file=sys.stderr)
        return []


def CJK_SINGLE(token: str) -> bool:  # noqa: N802
    return len(token) == 1 and "㐀" <= token <= "鿿"


async def retrieve(
    query: str,
    doc_ids: list[str] | None = None,
    k: int = 6,
) -> list[dict]:
    rows = _load_rows(doc_ids)
    if not rows:
        return []
    by_id = {r["id"]: r for r in rows}

    dense_ids: list[str] = []
    sim_by_id: dict[str, float] = {}
    sparse_ids = _sparse_search(query, doc_ids)

    if EMBED_PROVIDER == "ollama":
        q_vec = (await embed_texts([query]))[0]
        if q_vec is not None:
            q = np.asarray(q_vec, dtype=np.float32)
            q_norm = np.linalg.norm(q) or 1.0
            ids, vecs = [], []
            for r in rows:
                blob = r.get("embedding")
                if not blob:
                    continue
                v = np.frombuffer(blob, dtype=np.float32)
                if v.size != EMBED_DIM:
                    continue
                ids.append(r["id"])
                vecs.append(v)
            if vecs:
                mat = np.vstack(vecs)
                norms = np.linalg.norm(mat, axis=1)
                norms[norms == 0] = 1.0
                sims = (mat @ q) / (norms * q_norm)
                order = np.argsort(-sims)[:40]
                dense_ids = [ids[i] for i in order]
                sim_by_id = {ids[i]: float(sims[i]) for i in range(len(ids))}

    scores: dict[str, float] = {}
    for rank, cid in enumerate(dense_ids):
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (60 + rank + 1)
    for rank, cid in enumerate(sparse_ids):
        scores[cid] = scores.get(cid, 0.0) + 1.0 / (60 + rank + 1)

    ranked = sorted(scores.items(), key=lambda kv: -kv[1])

    # Drop dense candidates that are far below the best match. This keeps an
    # unrelated document from leaking into the context just because k is fixed.
    if sim_by_id:
        top_sim = max(sim_by_id.values())
        cutoff = max(0.30, top_sim * 0.75)
        filtered = [
            (cid, score)
            for cid, score in ranked
            if sim_by_id.get(cid, 0.0) >= cutoff
        ]
        print(f"[rag] top={top_sim:.3f} cutoff={cutoff:.3f} kept={len(filtered)}/{len(ranked)}", file=sys.stderr)
        if len(filtered) >= 3:
            ranked = filtered

    ranked = ranked[:k]
    results = []
    for cid, score in ranked:
        r = by_id.get(cid)
        if not r:
            continue
        results.append(
            {
                "chunk_id": cid,
                "doc_id": r["doc_id"],
                "doc_title": r["title"] or "Document",
                "page": r["page"],
                "idx": r["idx"],
                "text": r["text"],
                "score": round(float(score), 6),
            }
        )
    return results


def _add_neighbors(results: list[dict], max_total: int = 8) -> list[dict]:
    """Include adjacent chunks for the best hits.

    Lecture notes often split a list or a definition across a chunk boundary;
    pulling the neighbour keeps the answer grounded instead of forcing the
    model to fill the gap from memory.
    """
    if not results:
        return results
    combined = list(results)
    seen = {r["chunk_id"] for r in combined}
    with db() as conn:
        for hit in results[:4]:
            if len(combined) >= max_total:
                break
            for idx in (hit["idx"] - 1, hit["idx"] + 1):
                if idx < 0 or len(combined) >= max_total:
                    continue
                row = conn.execute(
                    """SELECT c.id, c.doc_id, c.page, c.idx, c.text, d.title
                       FROM chunks c JOIN documents d ON d.id = c.doc_id
                       WHERE c.doc_id = ? AND c.idx = ?""",
                    (hit["doc_id"], idx),
                ).fetchone()
                if row and row["id"] not in seen:
                    seen.add(row["id"])
                    combined.append(
                        {
                            "chunk_id": row["id"],
                            "doc_id": row["doc_id"],
                            "doc_title": row["title"] or "Document",
                            "page": row["page"],
                            "idx": row["idx"],
                            "text": row["text"],
                            "score": 0.0,
                        }
                    )
    combined.sort(key=lambda item: (item["doc_id"], item["idx"]))
    return combined


async def gather_chunks(
    doc_ids: list[str] | None = None,
    focus: list[str] | None = None,
    limit: int = 12,
) -> list[dict]:
    """Collect diverse source chunks for quiz / flashcard generation."""
    picked: list[dict] = []
    seen: set[str] = set()

    def add(items: list[dict], cap: int) -> None:
        for item in items:
            if item["chunk_id"] in seen:
                continue
            seen.add(item["chunk_id"])
            picked.append(item)
            if len(picked) >= cap:
                return

    if focus:
        for concept in focus[:4]:
            add(await retrieve(concept, doc_ids, k=3), limit)
            if len(picked) >= limit:
                break
    else:
        add(await retrieve("key concepts definitions examples important ideas formulas", doc_ids, k=limit), limit)

    if len(picked) < min(limit, 6):
        rows = _load_rows(doc_ids)
        groups: dict[str, list[dict]] = {}
        for row in rows:
            groups.setdefault(row["doc_id"], []).append(row)
        per_doc = max(2, limit // max(1, len(groups)))
        for group in groups.values():
            group.sort(key=lambda r: r["idx"])
            step = max(1, len(group) // per_doc)
            for row in group[::step][:per_doc]:
                add(
                    [
                        {
                            "chunk_id": row["id"],
                            "doc_id": row["doc_id"],
                            "doc_title": row["title"] or "Document",
                            "page": row["page"],
                            "text": row["text"],
                            "score": 0.0,
                        }
                    ],
                    limit,
                )
                if len(picked) >= limit:
                    break
            if len(picked) >= limit:
                break

    return picked[:limit]


def format_sources(sources: list[dict], max_chars: int = 1600) -> tuple[str, list[dict]]:
    """Build the numbered SOURCES block and the client-facing source list."""
    blocks: list[str] = []
    client: list[dict] = []
    for i, src in enumerate(sources, 1):
        text = src["text"].strip()
        if len(text) > max_chars:
            text = text[:max_chars].rsplit(" ", 1)[0] + " …"
        blocks.append(f'[{i}] Document: "{src["doc_title"]}" | page {src["page"]}\n{text}')
        client.append(
            {
                "n": i,
                "chunk_id": src["chunk_id"],
                "doc_id": src["doc_id"],
                "doc_title": src["doc_title"],
                "page": src["page"],
                "snippet": src["text"][:1200],
            }
        )
    return "\n\n".join(blocks), client
