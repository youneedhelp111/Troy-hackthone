"""SQLite storage layer. Single-file DB, WAL mode, per-call connections."""
from __future__ import annotations

import sqlite3
import uuid
from contextlib import contextmanager

from .config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS documents (
    id          TEXT PRIMARY KEY,
    filename    TEXT NOT NULL,
    title       TEXT,
    kind        TEXT,
    size        INTEGER DEFAULT 0,
    pages       INTEGER DEFAULT 0,
    chunk_count INTEGER DEFAULT 0,
    concepts    TEXT DEFAULT '[]',
    summary     TEXT DEFAULT '',
    status      TEXT DEFAULT 'processing',
    error       TEXT,
    created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chunks (
    id          TEXT PRIMARY KEY,
    doc_id      TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page        INTEGER DEFAULT 1,
    idx         INTEGER DEFAULT 0,
    text        TEXT NOT NULL,
    text_search TEXT NOT NULL,
    embedding   BLOB
);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON chunks(doc_id);

CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
    text_search,
    chunk_id UNINDEXED,
    doc_id UNINDEXED,
    tokenize = 'unicode61 remove_diacritics 2'
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id         TEXT PRIMARY KEY,
    title      TEXT,
    doc_ids    TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id         TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role       TEXT NOT NULL,
    content    TEXT NOT NULL,
    sources    TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);

CREATE TABLE IF NOT EXISTS quizzes (
    id         TEXT PRIMARY KEY,
    title      TEXT,
    doc_ids    TEXT DEFAULT '[]',
    difficulty TEXT DEFAULT 'medium',
    questions  TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id         TEXT PRIMARY KEY,
    quiz_id    TEXT,
    score      INTEGER DEFAULT 0,
    total      INTEGER DEFAULT 0,
    answers    TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS flashcards (
    id             TEXT PRIMARY KEY,
    doc_id         TEXT,
    concept        TEXT,
    front          TEXT NOT NULL,
    back           TEXT NOT NULL,
    source_chunk_id TEXT,
    review_count   INTEGER DEFAULT 0,
    known_count    INTEGER DEFAULT 0,
    created_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS flashcard_reviews (
    id           TEXT PRIMARY KEY,
    flashcard_id TEXT,
    known        INTEGER DEFAULT 0,
    created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mastery (
    concept   TEXT PRIMARY KEY,
    correct   INTEGER DEFAULT 0,
    total     INTEGER DEFAULT 0,
    last_seen TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"""


def new_id() -> str:
    return uuid.uuid4().hex[:12]


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def db():
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with db() as conn:
        conn.executescript(SCHEMA)


def bump_mastery(conn: sqlite3.Connection, concept: str | None, correct: bool) -> None:
    concept = (concept or "General").strip()[:120] or "General"
    conn.execute(
        """INSERT INTO mastery(concept, correct, total, last_seen)
           VALUES (?, ?, 1, datetime('now'))
           ON CONFLICT(concept) DO UPDATE SET
             correct = correct + excluded.correct,
             total   = total + 1,
             last_seen = datetime('now')""",
        (concept, 1 if correct else 0),
    )
