Write-Host "====================================================================" -ForegroundColor DarkYellow
Write-Host "  Style AI - Explainable AI Fashion & Makeup Advisor" -ForegroundColor Yellow
Write-Host "  Your Personal AI Stylist" -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor DarkYellow
Write-Host ""

$root = $PSScriptRoot

Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; python backend/run_backend.py"

Write-Host "[2/3] Starting Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root/frontend'; npm run dev"

Write-Host "[3/3] Waiting for servers to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 4

Write-Host "Opening Style AI in your browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/#studio"

Write-Host ""
Write-Host "====================================================================" -ForegroundColor DarkYellow
Write-Host "  Style AI is running!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173/#studio" -ForegroundColor White
Write-Host "  Backend  : http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor DarkYellow
