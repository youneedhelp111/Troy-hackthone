"""Start StudyPal and open the browser."""
from __future__ import annotations

import threading
import time
import webbrowser

import uvicorn


def _open() -> None:
    time.sleep(1.6)
    webbrowser.open("http://127.0.0.1:8000")


if __name__ == "__main__":
    threading.Thread(target=_open, daemon=True).start()
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info")
