"""Runtime LLM settings. Values saved from the web UI override the .env defaults."""
from __future__ import annotations

from .config import DEEPSEEK_BASE, DEEPSEEK_KEY, DEEPSEEK_MODEL
from .db import db

_KEYS = ("api_key", "base_url", "model")


def load() -> dict:
    """Effective settings: .env defaults overlaid with any DB overrides.

    Read fresh on every call so a change made in Settings takes effect on the
    very next request without a restart.
    """
    out = {"api_key": DEEPSEEK_KEY, "base_url": DEEPSEEK_BASE, "model": DEEPSEEK_MODEL}
    try:
        with db() as conn:
            rows = conn.execute(
                "SELECT key, value FROM settings WHERE key IN ('api_key','base_url','model')"
            ).fetchall()
        for row in rows:
            if row["value"]:
                out[row["key"]] = row["value"]
    except Exception:  # noqa: BLE001 — DB not ready yet; fall back to env
        pass
    return out


def save(api_key: str | None = None, base_url: str | None = None, model: str | None = None) -> dict:
    """Persist non-empty overrides and return the effective settings.

    Empty / None values are ignored, so an empty field means "keep the current
    value" rather than wiping it out.
    """
    updates = {"api_key": api_key, "base_url": base_url, "model": model}
    with db() as conn:
        for key, value in updates.items():
            if value is None:
                continue
            value = str(value).strip()
            if not value:
                continue
            if key == "base_url":
                value = value.rstrip("/")
            conn.execute(
                "INSERT INTO settings(key, value) VALUES (?, ?) "
                "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, value),
            )
    return load()


def mask_key(key: str) -> str:
    """Return a display-safe preview of an API key: sk-…abcd."""
    key = (key or "").strip()
    if len(key) <= 12:
        return "••••" if key else ""
    return f"{key[:6]}…{key[-4:]}"
