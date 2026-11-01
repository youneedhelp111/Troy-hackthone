"""StudyPal API — FastAPI app serving the SPA and all study features."""
from __future__ import annotations

import asyncio
import json
import sys
from contextlib import asynccontextmanager
from datetime import date, timedelta
from pathlib import Path

import httpx
import numpy as np
from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .config import (
    DATA_DIR,
    DEEPSEEK_MODEL,
    EMBED_MODEL,
    EMBED_PROVIDER,
    MAX_DOCS,
    MAX_UPLOAD_MB,
    OLLAMA_URL,
    STATIC_DIR,
    UPLOAD_DIR,
)
from .db import bump_mastery, db, init_db, new_id
from .ingest import SUPPORTED_EXT, chunk_sections, fts_tokens, parse_file
from .llm import LLMError, complete_json, stream
from .prompts import (
    CHAT_SYSTEM,
    CHAT_USER,
    flashcard_prompt,
    meta_prompt,
    quiz_prompt,
    study_plan_prompt,
)
from .rag import embed_texts, format_sources, gather_chunks, retrieve


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("[studypal] database ready", file=sys.stderr)
    yield


app = FastAPI(title="StudyPal", lifespan=lifespan)


# ------------------------------------------------------------------ models

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = None
    doc_ids: list[str] | None = None


class QuizRequest(BaseModel):
    doc_ids: list[str] | None = None
    count: int = Field(default=8, ge=3, le=20)
    difficulty: str = "medium"
    focus: list[str] | None = None


class QuizSubmitRequest(BaseModel):
    answers: list[int | None]


class FlashcardRequest(BaseModel):
    doc_ids: list[str] | None = None
    count: int = Field(default=10, ge=4, le=30)
    focus: list[str] | None = None


class ReviewRequest(BaseModel):
    flashcard_id: str
    known: bool


class PlanRequest(BaseModel):
    doc_ids: list[str] | None = None


# ------------------------------------------------------------------ helpers

def _doc_json(row) -> dict:
    d = dict(row)
    try:
        d["concepts"] = json.loads(d.get("concepts") or "[]")
    except json.JSONDecodeError:
        d["concepts"] = []
    return d


def _chunk_embedding_blob(vector: list[float] | None) -> bytes | None:
    if vector is None:
        return None
    return np.asarray(vector, dtype=np.float32).tobytes()


def _snippet(text: str, n: int = 420) -> str:
    text = " ".join(text.split())
    return text if len(text) <= n else text[: n - 1].rsplit(" ", 1)[0] + "…"


async def _extract_meta(filename: str, sample: str) -> dict:
    fallback = {"title": Path(filename).stem.replace("_", " ").strip() or "Document", "summary": "", "concepts": []}
    try:
        data = await complete_json(
            [{"role": "user", "content": meta_prompt(filename, sample)}],
            max_tokens=900,
            temperature=0.2,
        )
        concepts = [str(c).strip() for c in data.get("concepts", []) if str(c).strip()][:8]
        return {
            "title": (str(data.get("title") or fallback["title"]).strip())[:120],
            "summary": str(data.get("summary") or "").strip()[:600],
            "concepts": concepts,
        }
    except Exception as exc:  # noqa: BLE001
        print(f"[studypal] metadata extraction failed: {exc}", file=sys.stderr)
        return fallback


async def process_document(doc_id: str, path: Path, filename: str) -> None:
    try:
        sections, pages = await asyncio.to_thread(parse_file, path, filename)
        chunks = chunk_sections(sections)
        if not chunks:
            raise ValueError("No selectable text found. Scanned PDFs need OCR before upload.")

        vectors = await embed_texts([c["text"] for c in chunks])

        with db() as conn:
            for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
                chunk_id = new_id()
                conn.execute(
                    "INSERT INTO chunks(id, doc_id, page, idx, text, text_search, embedding) VALUES (?,?,?,?,?,?,?)",
                    (
                        chunk_id,
                        doc_id,
                        chunk["page"],
                        i,
                        chunk["text"],
                        " ".join(fts_tokens(chunk["text"]))[:120000],
                        _chunk_embedding_blob(vector),
                    ),
                )
                conn.execute(
                    "INSERT INTO chunks_fts(text_search, chunk_id, doc_id) VALUES (?,?,?)",
                    (" ".join(fts_tokens(chunk["text"]))[:120000], chunk_id, doc_id),
                )
            conn.execute(
                "UPDATE documents SET chunk_count=?, pages=? WHERE id=?",
                (len(chunks), max(pages, 1), doc_id),
            )

        meta = await _extract_meta(filename, "\n\n".join(c["text"] for c in chunks[:8]))
        with db() as conn:
            conn.execute(
                "UPDATE documents SET title=?, summary=?, concepts=?, status='ready' WHERE id=?",
                (meta["title"], meta["summary"], json.dumps(meta["concepts"], ensure_ascii=False), doc_id),
            )
    except Exception as exc:  # noqa: BLE001
        print(f"[studypal] processing failed for {filename}: {exc}", file=sys.stderr)
        with db() as conn:
            conn.execute(
                "UPDATE documents SET status='failed', error=? WHERE id=?",
                (str(exc)[:500], doc_id),
            )


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


# ------------------------------------------------------------------ health & docs

@app.get("/api/health")
async def health():
    ollama_ok = False
    if EMBED_PROVIDER == "ollama":
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                ollama_ok = (await client.get(f"{OLLAMA_URL}/api/tags")).status_code == 200
        except Exception:  # noqa: BLE001
            ollama_ok = False
    with db() as conn:
        docs = conn.execute("SELECT COUNT(*) c FROM documents").fetchone()["c"]
        chunks = conn.execute("SELECT COUNT(*) c FROM chunks").fetchone()["c"]
    return {
        "ok": True,
        "llm_model": DEEPSEEK_MODEL,
        "embed_provider": EMBED_PROVIDER,
        "embed_model": EMBED_MODEL if EMBED_PROVIDER == "ollama" else None,
        "embedding_ready": EMBED_PROVIDER != "ollama" or ollama_ok,
        "documents": docs,
        "chunks": chunks,
    }


@app.get("/api/documents")
async def list_documents():
    with db() as conn:
        rows = conn.execute("SELECT * FROM documents ORDER BY created_at DESC").fetchall()
    return {"documents": [_doc_json(r) for r in rows]}


@app.get("/api/documents/{doc_id}")
async def get_document(doc_id: str):
    with db() as conn:
        row = conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Document not found")
    return _doc_json(row)


@app.post("/api/documents")
async def upload_documents(background: BackgroundTasks, files: list[UploadFile] = File(...)):
    with db() as conn:
        existing = conn.execute("SELECT COUNT(*) c FROM documents").fetchone()["c"]
    if existing + len(files) > MAX_DOCS:
        raise HTTPException(400, f"Document limit reached ({MAX_DOCS}). Delete some materials first.")

    created = []
    for upload in files:
        filename = Path(upload.filename or "document").name
        ext = Path(filename).suffix.lower()
        if ext not in SUPPORTED_EXT:
            raise HTTPException(400, f"Unsupported file type: {ext or 'unknown'} ({filename})")
        content = await upload.read()
        if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
            raise HTTPException(413, f"{filename} is larger than {MAX_UPLOAD_MB} MB")
        if not content:
            raise HTTPException(400, f"{filename} is empty")

        doc_id = new_id()
        dest = UPLOAD_DIR / f"{doc_id}{ext}"
        dest.write_bytes(content)
        with db() as conn:
            conn.execute(
                "INSERT INTO documents(id, filename, title, kind, size, status) VALUES (?,?,?,?,?,'processing')",
                (doc_id, filename, Path(filename).stem, ext.lstrip("."), len(content)),
            )
        background.add_task(process_document, doc_id, dest, filename)
        created.append({"id": doc_id, "filename": filename, "status": "processing"})
    return {"documents": created}


@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    with db() as conn:
        row = conn.execute("SELECT * FROM documents WHERE id=?", (doc_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Document not found")
        conn.execute("DELETE FROM chunks_fts WHERE doc_id=?", (doc_id,))
        conn.execute("DELETE FROM chunks WHERE doc_id=?", (doc_id,))
        conn.execute("DELETE FROM documents WHERE id=?", (doc_id,))
    for ext in SUPPORTED_EXT:
        candidate = UPLOAD_DIR / f"{doc_id}{ext}"
        if candidate.exists():
            candidate.unlink(missing_ok=True)
    return {"ok": True}


# ------------------------------------------------------------------ chat

@app.get("/api/sessions")
async def list_sessions():
    with db() as conn:
        rows = conn.execute(
            """SELECT s.id, s.title, s.created_at, COUNT(m.id) AS messages
               FROM chat_sessions s LEFT JOIN chat_messages m ON m.session_id = s.id
               GROUP BY s.id ORDER BY s.created_at DESC LIMIT 30"""
        ).fetchall()
    return {"sessions": [dict(r) for r in rows]}


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    with db() as conn:
        session = conn.execute("SELECT * FROM chat_sessions WHERE id=?", (session_id,)).fetchone()
        if not session:
            raise HTTPException(404, "Session not found")
        rows = conn.execute(
            "SELECT * FROM chat_messages WHERE session_id=? ORDER BY created_at, rowid", (session_id,)
        ).fetchall()
    messages = []
    for row in rows:
        msg = dict(row)
        try:
            msg["sources"] = json.loads(msg.get("sources") or "[]")
        except json.JSONDecodeError:
            msg["sources"] = []
        messages.append(msg)
    return {"session": dict(session), "messages": messages}


@app.post("/api/chat")
async def chat(req: ChatRequest):
    message = req.message.strip()
    if not message:
        raise HTTPException(400, "Empty message")

    doc_ids = req.doc_ids or None
    session_id = req.session_id
    with db() as conn:
        if session_id:
            exists = conn.execute("SELECT id FROM chat_sessions WHERE id=?", (session_id,)).fetchone()
            if not exists:
                session_id = None

    # Retrieval uses the previous question too, so short follow-ups still work.
    search_query = message
    if session_id and len(message) < 60:
        with db() as conn:
            prev = conn.execute(
                "SELECT content FROM chat_messages WHERE session_id=? AND role='user' ORDER BY rowid DESC LIMIT 1",
                (session_id,),
            ).fetchone()
        if prev:
            search_query = f"{prev['content']} {message}"

    sources: list[dict] = []
    try:
        sources = await retrieve(search_query, doc_ids, k=6)
    except Exception as exc:  # noqa: BLE001
        print(f"[studypal] retrieval failed: {exc}", file=sys.stderr)

    new_session = False
    if not session_id:
        session_id = new_id()
        new_session = True
        with db() as conn:
            conn.execute(
                "INSERT INTO chat_sessions(id, title, doc_ids) VALUES (?,?,?)",
                (session_id, message[:70], json.dumps(doc_ids or [])),
            )

    with db() as conn:
        conn.execute(
            "INSERT INTO chat_messages(id, session_id, role, content) VALUES (?,?,?,?)",
            (new_id(), session_id, "user", message),
        )
        history_rows = conn.execute(
            "SELECT role, content FROM chat_messages WHERE session_id=? ORDER BY rowid DESC LIMIT 9",
            (session_id,),
        ).fetchall()
    history = [{"role": r["role"], "content": r["content"]} for r in reversed(history_rows)][:-1]

    sources_block, client_sources = format_sources(sources)

    async def event_stream():
        yield _sse("meta", {"session_id": session_id, "new_session": new_session, "sources": client_sources})
        if not sources:
            text = (
                "I don't have anything to search yet. Upload your lecture notes, slides, or PDFs in "
                "**Materials**, and then ask me again."
                if not doc_ids and not _has_docs()
                else "I couldn't find that in your materials. Try rephrasing, or upload the relevant notes."
            )
            yield _sse("delta", {"text": text})
            with db() as conn:
                conn.execute(
                    "INSERT INTO chat_messages(id, session_id, role, content, sources) VALUES (?,?,?,?,?)",
                    (new_id(), session_id, "assistant", text, "[]"),
                )
            yield _sse("done", {"sources": []})
            return

        messages = [{"role": "system", "content": CHAT_SYSTEM}]
        messages.extend(history)
        messages.append(
            {
                "role": "user",
                "content": CHAT_USER.format(sources=sources_block, question=message),
            }
        )

        parts: list[str] = []
        try:
            async for delta in stream(messages, temperature=0.35, max_tokens=2200):
                parts.append(delta)
                yield _sse("delta", {"text": delta})
        except Exception as exc:  # noqa: BLE001
            print(f"[studypal] stream failed: {exc}", file=sys.stderr)
            yield _sse("error", {"message": "The AI service hiccuped. Try again in a moment."})

        answer = "".join(parts).strip()
        if answer:
            with db() as conn:
                conn.execute(
                    "INSERT INTO chat_messages(id, session_id, role, content, sources) VALUES (?,?,?,?,?)",
                    (
                        new_id(),
                        session_id,
                        "assistant",
                        answer,
                        json.dumps(client_sources, ensure_ascii=False),
                    ),
                )
        yield _sse("done", {"sources": client_sources})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


def _has_docs() -> bool:
    with db() as conn:
        return (
            conn.execute("SELECT COUNT(*) c FROM documents WHERE status='ready'").fetchone()["c"] > 0
        )


# ------------------------------------------------------------------ quiz

@app.post("/api/quiz/generate")
async def generate_quiz(req: QuizRequest):
    difficulty = req.difficulty if req.difficulty in {"easy", "medium", "hard"} else "medium"
    chunks = await gather_chunks(req.doc_ids, req.focus, limit=12)
    if not chunks:
        raise HTTPException(400, "Upload study materials first, then generate a quiz.")

    labels = {f"S{i}": c for i, c in enumerate(chunks, 1)}
    sources_block = "\n\n".join(
        f'[S{i}] Document: "{c["doc_title"]}" | page {c["page"]}\n{c["text"][:1500]}'
        for i, c in enumerate(chunks, 1)
    )

    try:
        data = await complete_json(
            [{"role": "user", "content": quiz_prompt(req.count, difficulty, req.focus, sources_block)}],
            max_tokens=7000,
            temperature=0.55,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Quiz generation failed: {str(exc)[:200]}") from exc

    questions: list[dict] = []
    for i, item in enumerate(data.get("questions", [])):
        options = [str(o).strip() for o in item.get("options", []) if str(o).strip()]
        if len(options) < 4 or not str(item.get("question", "")).strip():
            continue
        options = options[:4]
        try:
            answer_index = int(item.get("answer_index", 0))
        except (TypeError, ValueError):
            answer_index = 0
        answer_index = max(0, min(3, answer_index))
        source = labels.get(str(item.get("source", "")).strip()) or chunks[i % len(chunks)]
        questions.append(
            {
                "id": f"q{i + 1}",
                "concept": str(item.get("concept") or "General").strip()[:80],
                "question": str(item["question"]).strip(),
                "options": options,
                "answer_index": answer_index,
                "explanation": str(item.get("explanation") or "").strip(),
                "source": {
                    "chunk_id": source["chunk_id"],
                    "doc_id": source["doc_id"],
                    "doc_title": source["doc_title"],
                    "page": source["page"],
                    "snippet": _snippet(source["text"]),
                },
            }
        )
        if len(questions) >= req.count:
            break

    if not questions:
        raise HTTPException(502, "The AI returned no usable questions. Try again.")

    quiz_id = new_id()
    title = str(data.get("title") or "Practice Quiz").strip()[:120]
    with db() as conn:
        conn.execute(
            "INSERT INTO quizzes(id, title, doc_ids, difficulty, questions) VALUES (?,?,?,?,?)",
            (quiz_id, title, json.dumps(req.doc_ids or []), difficulty, json.dumps(questions, ensure_ascii=False)),
        )
    return {"id": quiz_id, "title": title, "difficulty": difficulty, "questions": questions}


@app.post("/api/quiz/{quiz_id}/submit")
async def submit_quiz(quiz_id: str, req: QuizSubmitRequest):
    with db() as conn:
        row = conn.execute("SELECT * FROM quizzes WHERE id=?", (quiz_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Quiz not found")
        questions = json.loads(row["questions"])
        answers = req.answers
        results = []
        score = 0
        for i, q in enumerate(questions):
            selected = answers[i] if i < len(answers) else None
            correct = selected == q["answer_index"]
            score += 1 if correct else 0
            bump_mastery(conn, q.get("concept"), correct)
            results.append(
                {
                    "index": i,
                    "selected": selected,
                    "correct": correct,
                    "answer_index": q["answer_index"],
                    "explanation": q.get("explanation", ""),
                    "concept": q.get("concept", "General"),
                    "source": q.get("source", {}),
                }
            )
        attempt_id = new_id()
        conn.execute(
            "INSERT INTO quiz_attempts(id, quiz_id, score, total, answers) VALUES (?,?,?,?,?)",
            (attempt_id, quiz_id, score, len(questions), json.dumps(answers)),
        )

    percent = round(score / max(1, len(questions)) * 100)
    weak = sorted({r["concept"] for r in results if not r["correct"]})
    return {
        "attempt_id": attempt_id,
        "score": score,
        "total": len(questions),
        "percent": percent,
        "results": results,
        "weak_concepts": weak,
    }


# ------------------------------------------------------------------ flashcards

@app.post("/api/flashcards/generate")
async def generate_flashcards(req: FlashcardRequest):
    chunks = await gather_chunks(req.doc_ids, req.focus, limit=12)
    if not chunks:
        raise HTTPException(400, "Upload study materials first, then generate flashcards.")

    labels = {f"S{i}": c for i, c in enumerate(chunks, 1)}
    sources_block = "\n\n".join(
        f'[S{i}] Document: "{c["doc_title"]}" | page {c["page"]}\n{c["text"][:1300]}'
        for i, c in enumerate(chunks, 1)
    )
    try:
        data = await complete_json(
            [{"role": "user", "content": flashcard_prompt(req.count, req.focus, sources_block)}],
            max_tokens=6000,
            temperature=0.55,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(502, f"Flashcard generation failed: {str(exc)[:200]}") from exc

    cards: list[dict] = []
    with db() as conn:
        for i, item in enumerate(data.get("cards", [])):
            front = str(item.get("front") or "").strip()
            back = str(item.get("back") or "").strip()
            if not front or not back:
                continue
            source = labels.get(str(item.get("source", "")).strip()) or chunks[i % len(chunks)]
            card_id = new_id()
            concept = str(item.get("concept") or "General").strip()[:80]
            conn.execute(
                "INSERT INTO flashcards(id, doc_id, concept, front, back, source_chunk_id) VALUES (?,?,?,?,?,?)",
                (card_id, source["doc_id"], concept, front, back, source["chunk_id"]),
            )
            cards.append(
                {
                    "id": card_id,
                    "front": front,
                    "back": back,
                    "concept": concept,
                    "doc_title": source["doc_title"],
                    "page": source["page"],
                }
            )
            if len(cards) >= req.count:
                break

    if not cards:
        raise HTTPException(502, "The AI returned no usable flashcards. Try again.")
    return {"cards": cards}


@app.get("/api/flashcards")
async def list_flashcards(doc_id: str | None = None, limit: int = 100):
    sql = """SELECT f.*, d.title AS doc_title FROM flashcards f
             LEFT JOIN documents d ON d.id = f.doc_id"""
    params: list = []
    if doc_id:
        sql += " WHERE f.doc_id = ?"
        params.append(doc_id)
    sql += " ORDER BY f.created_at DESC, f.rowid DESC LIMIT ?"
    params.append(min(limit, 300))
    with db() as conn:
        rows = conn.execute(sql, params).fetchall()
    return {"flashcards": [dict(r) for r in rows]}


@app.post("/api/flashcards/review")
async def review_flashcard(req: ReviewRequest):
    with db() as conn:
        card = conn.execute("SELECT * FROM flashcards WHERE id=?", (req.flashcard_id,)).fetchone()
        if not card:
            raise HTTPException(404, "Flashcard not found")
        conn.execute(
            "UPDATE flashcards SET review_count = review_count + 1, known_count = known_count + ? WHERE id=?",
            (1 if req.known else 0, req.flashcard_id),
        )
        conn.execute(
            "INSERT INTO flashcard_reviews(id, flashcard_id, known) VALUES (?,?,?)",
            (new_id(), req.flashcard_id, 1 if req.known else 0),
        )
        bump_mastery(conn, card["concept"], req.known)
    return {"ok": True}


# ------------------------------------------------------------------ insights

@app.get("/api/analytics")
async def analytics():
    with db() as conn:
        docs = conn.execute("SELECT * FROM documents WHERE status='ready' ORDER BY created_at DESC").fetchall()
        chunk_count = conn.execute("SELECT COUNT(*) c FROM chunks").fetchone()["c"]
        quiz_count = conn.execute("SELECT COUNT(*) c FROM quizzes").fetchone()["c"]
        attempts = conn.execute("SELECT * FROM quiz_attempts ORDER BY created_at DESC LIMIT 20").fetchall()
        card_stats = conn.execute(
            "SELECT COUNT(*) total, COALESCE(SUM(review_count),0) reviews, COALESCE(SUM(known_count),0) known FROM flashcards"
        ).fetchone()
        mastery_rows = conn.execute("SELECT * FROM mastery ORDER BY total DESC").fetchall()

    questions_answered = sum(a["total"] for a in attempts)
    correct = sum(a["score"] for a in attempts)
    accuracy = round(correct / questions_answered * 100) if questions_answered else 0

    mastery = []
    for row in mastery_rows:
        total = row["total"] or 0
        percent = (row["correct"] + 0.5) / (total + 1)  # smoothed
        mastery.append(
            {
                "concept": row["concept"],
                "correct": row["correct"],
                "total": total,
                "percent": round(percent, 3),
                "last_seen": row["last_seen"],
            }
        )
    mastery.sort(key=lambda m: (-m["total"], m["percent"]))

    weak = [m for m in mastery if m["total"] >= 1 and m["percent"] < 0.72][:6]

    recommendations: list[dict] = []
    if not docs:
        recommendations.append({"title": "Upload your first material", "body": "Add lecture notes, slides, or a PDF. StudyPal builds its index locally in seconds."})
    if weak:
        top = weak[0]
        recommendations.append(
            {
                "title": f"Review {top['concept']}",
                "body": f"You're at {round(top['percent'] * 100)}% on this topic. Generate a focused quiz or flashcard deck.",
                "concept": top["concept"],
            }
        )
    if docs and not attempts:
        recommendations.append({"title": "Take a baseline quiz", "body": "An 8-question quiz will show exactly which topics need work."})
    if docs and attempts and accuracy >= 80 and not weak:
        recommendations.append({"title": "Raise the difficulty", "body": f"You're averaging {accuracy}%. Switch to hard-mode questions or combine multiple documents."})
    if card_stats["total"]:
        known_rate = round(card_stats["known"] / max(1, card_stats["reviews"]) * 100) if card_stats["reviews"] else 0
        recommendations.append({"title": "Keep cards in rotation", "body": f"{card_stats['reviews']} reviews so far, {known_rate}% marked as known. Revisit the red deck tomorrow."})
    if not recommendations:
        recommendations.append({"title": "Ask a question", "body": "Try asking StudyPal to compare two concepts or give a worked example."})

    today = date.today()
    activity = []
    with db() as conn:
        quiz_by_day = {r["d"]: r["c"] for r in conn.execute("SELECT date(created_at) d, COUNT(*) c FROM quiz_attempts GROUP BY d")}
        card_by_day = {r["d"]: r["c"] for r in conn.execute("SELECT date(created_at) d, COUNT(*) c FROM flashcard_reviews GROUP BY d")}
        chat_by_day = {r["d"]: r["c"] for r in conn.execute("SELECT date(created_at) d, COUNT(*) c FROM chat_messages WHERE role='user' GROUP BY d")}
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        key = day.isoformat()
        activity.append(
            {
                "date": key,
                "label": day.strftime("%a"),
                "quiz": quiz_by_day.get(key, 0),
                "cards": card_by_day.get(key, 0),
                "chat": chat_by_day.get(key, 0),
                "total": quiz_by_day.get(key, 0) + card_by_day.get(key, 0) + chat_by_day.get(key, 0),
            }
        )

    return {
        "documents": [_doc_json(d) for d in docs],
        "stats": {
            "documents": len(docs),
            "chunks": chunk_count,
            "quizzes": quiz_count,
            "questions_answered": questions_answered,
            "accuracy": accuracy,
            "flashcards": card_stats["total"],
            "card_reviews": card_stats["reviews"],
            "cards_known": card_stats["known"],
        },
        "mastery": mastery[:12],
        "weak": weak,
        "recommendations": recommendations[:4],
        "activity": activity,
    }


@app.post("/api/study-plan")
async def study_plan(req: PlanRequest):
    data = await analytics()
    weak = data["weak"]
    docs = [{"title": d["title"], "pages": d["pages"]} for d in data["documents"]]
    if not docs:
        raise HTTPException(400, "Upload materials first.")
    try:
        plan = await complete_json(
            [{"role": "user", "content": study_plan_prompt(weak, docs)}],
            max_tokens=1200,
            temperature=0.5,
        )
        text = str(plan.get("plan") or plan.get("markdown") or plan.get("text") or "").strip()
        if not text:
            text = json.dumps(plan)[:1200]
    except Exception:  # noqa: BLE001
        # Last-resort readable plan if the model ignores JSON mode.
        from .llm import complete

        text = await complete(
            [
                {"role": "system", "content": "You are a concise academic coach. Reply in markdown."},
                {"role": "user", "content": study_plan_prompt(weak, docs) + "\n\nDo not return JSON. Return the plan as markdown."},
            ],
            temperature=0.5,
            max_tokens=1200,
        )
    return {"plan": text}


@app.get("/api/suggestions")
async def suggestions():
    with db() as conn:
        docs = conn.execute(
            "SELECT title, concepts FROM documents WHERE status='ready' ORDER BY created_at DESC LIMIT 4"
        ).fetchall()
    concepts: list[str] = []
    for d in docs:
        try:
            concepts.extend(json.loads(d["concepts"] or "[]"))
        except json.JSONDecodeError:
            continue
    concepts = [c for c in dict.fromkeys(concepts) if c]
    out = []
    if len(concepts) >= 2:
        out.append(f"Explain {concepts[0]} in simple terms")
        out.append(f"How do {concepts[0]} and {concepts[1]} relate?")
    if len(concepts) >= 3:
        out.append(f"Give me a worked example of {concepts[2]}")
    if docs:
        out.append(f"What are the most exam-relevant ideas in “{docs[0]['title']}”?")
    if not out:
        out = [
            "Explain the key idea in my notes",
            "Make a 5-question quiz from my materials",
            "What should I review first?",
        ]
    return {"suggestions": out[:4]}


# ------------------------------------------------------------------ errors & static

@app.exception_handler(LLMError)
async def llm_error_handler(request, exc: LLMError):
    return JSONResponse(status_code=502, content={"detail": str(exc)[:300]})


@app.get("/favicon.svg")
async def favicon():
    return FileResponse(STATIC_DIR / "favicon.svg")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")
