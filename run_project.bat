@echo off
title Style AI - Explainable AI Fashion & Makeup Advisor
echo ====================================================================
echo   Style AI - Explainable AI Fashion & Makeup Advisor
echo   Your Personal AI Stylist
echo ====================================================================
echo.
echo [1/3] Starting FastAPI Backend at http://127.0.0.1:8000 ...
start "Style AI Backend Server" cmd /k "cd /d %~dp0 && python backend\run_backend.py"

echo [2/3] Starting Vite Frontend Client at http://localhost:5173 ...
start "Style AI Frontend Client" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo Launching Style AI in default browser...
start http://localhost:5173/#studio

echo.
echo ====================================================================
echo   Style AI is now running!
echo   Frontend : http://localhost:5173/#studio
echo   Backend  : http://127.0.0.1:8000/docs
echo ====================================================================
pause
