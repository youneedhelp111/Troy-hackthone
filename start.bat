@echo off
setlocal
cd /d "%~dp0"
set PYTHONIOENCODING=utf-8

where python >nul 2>nul
if errorlevel 1 (
  echo [StudyPal] Python was not found.
  echo             Install Python 3.11+ first: https://www.python.org/downloads/
  pause
  exit /b 1
)

echo [StudyPal] Installing dependencies...
python -m pip install -q -r requirements.txt
if errorlevel 1 (
  echo [StudyPal] Failed to install dependencies.
  echo             Try manually: python -m pip install -r requirements.txt
  pause
  exit /b 1
)

echo [StudyPal] Starting at http://127.0.0.1:8000 ...
python run.py
pause
