"""Document parsing, text normalization, tokenization and chunking."""
from __future__ import annotations

import re
from pathlib import Path

WORD_RE = re.compile(r"[a-z0-9]+")
CJK_RE = re.compile(r"[㐀-䶿一-鿿぀-ヿ가-힯]+")
SUPPORTED_EXT = {".pdf", ".docx", ".pptx", ".txt", ".md", ".markdown", ".csv"}


def fts_tokens(text: str, limit: int | None = None) -> list[str]:
    """Tokenize for FTS5: latin words + CJK bigrams (works for Chinese notes)."""
    text = (text or "").lower()
    tokens = [w for w in WORD_RE.findall(text) if len(w) > 1 or w.isdigit()]
    for run in CJK_RE.findall(text):
        if len(run) == 1:
            tokens.append(run)
        else:
            tokens.extend(run[i : i + 2] for i in range(len(run) - 1))
    if limit:
        tokens = tokens[:limit]
    return tokens


def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)          # join hyphenated breaks
    text = re.sub(r"[ \t ]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _split_sentences(paragraph: str, size: int) -> list[str]:
    parts = re.split(r"(?<=[.!?。！？:：])\s+|\n", paragraph)
    out, buf = [], ""
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if len(buf) + len(part) + 1 <= size:
            buf = (buf + " " + part).strip()
        else:
            if buf:
                out.append(buf)
            buf = part
    if buf:
        out.append(buf)
    return out


def chunk_sections(
    sections: list[tuple[int, str]], size: int = 900, overlap: int = 120
) -> list[dict]:
    """Merge sections into ~size-char chunks with a little overlap."""
    chunks: list[dict] = []
    buf = ""
    buf_page = sections[0][0] if sections else 1

    def flush() -> None:
        nonlocal buf
        text = buf.strip()
        if len(text) >= 40:
            chunks.append({"page": buf_page, "text": text})
        buf = ""

    for page, raw in sections:
        text = normalize_text(raw)
        if not text:
            continue
        paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        if len(paras) <= 1:
            paras = _split_sentences(text, size)

        for para in paras:
            if len(para) > size * 1.5:
                for piece in _split_sentences(para, size):
                    if len(buf) + len(piece) + 2 <= size:
                        buf = (buf + "\n\n" + piece).strip() if buf else piece
                        buf_page = buf_page if buf else page
                    else:
                        tail = buf[-overlap:] if overlap and buf else ""
                        flush()
                        buf = (tail + " " + piece).strip() if tail else piece
                        buf_page = page
                continue

            if not buf:
                buf_page = page
            if len(buf) + len(para) + 2 <= size:
                buf = (buf + "\n\n" + para).strip() if buf else para
            else:
                tail = buf[-overlap:] if overlap and buf else ""
                flush()
                buf = (tail + " " + para).strip() if tail else para
                buf_page = page

    flush()

    # Drop near-duplicates that can appear after overlap carry-over.
    seen: set[str] = set()
    unique: list[dict] = []
    for ch in chunks:
        key = re.sub(r"\W+", "", ch["text"].lower())[:200]
        if key in seen:
            continue
        seen.add(key)
        unique.append(ch)
    return unique


# ---------------------------------------------------------------- parsers

def _pdf_sections(path: Path) -> list[tuple[int, str]]:
    import pymupdf  # type: ignore

    doc = pymupdf.open(path)
    sections: list[tuple[int, str]] = []
    try:
        for i, page in enumerate(doc):
            text = page.get_text("text")
            if text and text.strip():
                sections.append((i + 1, text))
    finally:
        doc.close()
    return sections


def _docx_sections(path: Path) -> list[tuple[int, str]]:
    from docx import Document

    doc = Document(path)
    parts: list[str] = []
    for para in doc.paragraphs:
        if para.text.strip():
            parts.append(para.text)
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text.strip()]
            if cells:
                parts.append(" | ".join(cells))
    return [(1, "\n\n".join(parts))]


def _pptx_sections(path: Path) -> list[tuple[int, str]]:
    from pptx import Presentation

    prs = Presentation(path)
    sections: list[tuple[int, str]] = []
    for i, slide in enumerate(prs.slides):
        parts: list[str] = []
        for shape in slide.shapes:
            if getattr(shape, "has_text_frame", False):
                text = shape.text_frame.text.strip()
                if text:
                    parts.append(text)
            if getattr(shape, "has_table", False):
                for row in shape.table.rows:
                    cells = [c.text.strip() for c in row.cells if c.text.strip()]
                    if cells:
                        parts.append(" | ".join(cells))
        if parts:
            sections.append((i + 1, "\n\n".join(parts)))
    return sections


def _text_sections(path: Path) -> list[tuple[int, str]]:
    for encoding in ("utf-8-sig", "utf-8", "gb18030", "latin-1"):
        try:
            return [(1, path.read_text(encoding=encoding))]
        except (UnicodeDecodeError, UnicodeError):
            continue
    return []


def parse_file(path: Path, filename: str) -> tuple[list[tuple[int, str]], int]:
    """Return (sections, page_count). Sections are (page_or_slide_number, text)."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        sections = _pdf_sections(path)
        return sections, max((p for p, _ in sections), default=0)
    if ext == ".docx":
        return _docx_sections(path), 1
    if ext == ".pptx":
        sections = _pptx_sections(path)
        return sections, max((p for p, _ in sections), default=0)
    if ext in {".txt", ".md", ".markdown", ".csv"}:
        return _text_sections(path), 1
    raise ValueError(f"Unsupported file type: {ext or 'unknown'}")
