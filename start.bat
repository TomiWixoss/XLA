@echo off
title PyStegoWatermark - Starting...
color 0A

echo.
echo ========================================
echo   PyStegoWatermark Production Server
echo ========================================
echo.

REM Check if setup is needed
if not exist "backend\venv" (
    echo [!] Backend virtual environment not found!
    echo [!] Running first-time setup...
    echo.
    call setup.bat
    echo.
)

if not exist "frontend\node_modules" (
    echo [!] Frontend dependencies not found!
    echo [!] Running first-time setup...
    echo.
    call setup.bat
    echo.
)

REM Build frontend if needed
if not exist "frontend\.next" (
    echo [!] Building frontend for production...
    cd frontend
    call npm run build
    cd ..
    echo.
)

echo [1/2] Starting Backend (FastAPI)...
start "Backend - FastAPI" cmd /k "title Backend - FastAPI && color 0B && cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Next.js Production)...
start "Frontend - Next.js" cmd /k "title Frontend - Next.js && color 0E && cd frontend && npm run start"

echo.
echo ========================================
echo   Services Started Successfully!
echo ========================================
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo.
echo ========================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo Press any key to stop all services...
pause >nul

REM Stop all services
echo.
echo Stopping services...
taskkill /F /FI "WINDOWTITLE eq Backend - FastAPI*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Frontend - Next.js*" >nul 2>&1

echo.
echo All services stopped!
timeout /t 2 /nobreak >nul
