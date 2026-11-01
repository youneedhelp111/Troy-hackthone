#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
export PYTHONIOENCODING=utf-8

PY=python3
command -v python3 >/dev/null 2>&1 || PY=python

echo "[StudyPal] Installing dependencies..."
"$PY" -m pip install -q -r requirements.txt

echo "[StudyPal] Starting at http://127.0.0.1:8000 ..."
"$PY" run.py
