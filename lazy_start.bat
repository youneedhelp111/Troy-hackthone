@echo off
setlocal EnableExtensions
cd /d "%~dp0"

rem =====================================================================
rem  StudyPal - one-click setup & launch for a fresh computer
rem
rem  Steps:  1) install Python 3.13 if missing (via winget)
rem          2) pip install dependencies
rem          3) start the server + open the browser (Ctrl+C to stop)
rem          4) auto-commit local changes and push to GitHub
rem
rem  Run this from the project folder (next to requirements.txt).
rem  Git must already be installed for the push step (it skips otherwise).
rem =====================================================================

set "PYTHONIOENCODING=utf-8"

rem ---- tunables ----
set "PY_VER=3.13"
set "PY_DIR=Python313"
set "PY_EXE=%LOCALAPPDATA%\Programs\Python\%PY_DIR%\python.exe"
set "COMMIT_MSG=auto-save from lazy_start.bat"
set "GIT_NAME=StudyPal Auto"
set "GIT_EMAIL=auto@studypal.local"

rem =====================================================================
rem  1) Locate or install Python
rem =====================================================================
set "PY=python"
where python >nul 2>nul && goto :have_python

where py >nul 2>nul
if not errorlevel 1 (
    set "PY=py -3"
    goto :have_python
)

echo [StudyPal] Python not found - installing Python %PY_VER% via winget...
where winget >nul 2>nul
if errorlevel 1 goto :python_manual

winget install -e --id Python.Python.%PY_VER% --silent --accept-package-agreements --accept-source-agreements
if errorlevel 1 goto :python_manual

rem refresh PATH for the just-installed Python
set "PATH=%LOCALAPPDATA%\Programs\Python\%PY_DIR%\Scripts;%LOCALAPPDATA%\Programs\Python\%PY_DIR%;%PATH%"
set "PY=python"
where python >nul 2>nul || set "PY=%PY_EXE%"

:have_python
echo [StudyPal] Python ready:
%PY% --version
goto :install_deps

:python_manual
echo [StudyPal] Could not install Python automatically.
echo             Install Python 3.11+ from https://www.python.org/downloads/
echo             and tick "Add python.exe to PATH", then re-run this script.
pause
exit /b 1

rem =====================================================================
rem  2) Install dependencies
rem =====================================================================
:install_deps
echo [StudyPal] Installing dependencies...
%PY% -m pip install -q -r requirements.txt
if errorlevel 1 (
    echo [StudyPal] Dependency install failed.
    echo             Try manually: %PY% -m pip install -r requirements.txt
    pause
    exit /b 1
)

rem =====================================================================
rem  3) Start server (opens the browser automatically)
rem =====================================================================
echo [StudyPal] Starting at http://127.0.0.1:8000  (Ctrl+C to stop)...
%PY% run.py

rem =====================================================================
rem  4) Auto-commit and push to GitHub (runs after you stop the server)
rem =====================================================================
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
    echo [StudyPal] Not a git repo (or git missing) - skipping GitHub push.
    goto :done
)

git config user.name  >nul 2>nul || git config user.name  "%GIT_NAME%"
git config user.email >nul 2>nul || git config user.email "%GIT_EMAIL%"

echo [StudyPal] Committing and pushing to GitHub...
git add -A
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo [StudyPal] Nothing to commit - working tree is already clean.
    goto :done
)
git push
echo [StudyPal] Pushed to GitHub.

:done
echo [StudyPal] Done.
pause
