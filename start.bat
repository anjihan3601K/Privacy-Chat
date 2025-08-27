@echo off
echo ========================================
echo Starting Quantum Chat Application
echo ========================================
echo.

echo Starting backend server...
start "Quantum Chat Backend" cmd /k "cd backend && uv run python main.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting frontend development server...
start "Quantum Chat Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause >nul
