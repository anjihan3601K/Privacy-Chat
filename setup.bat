@echo off
echo ========================================
echo Quantum Chat Application Setup
echo ========================================
echo.

echo Setting up backend...
cd backend
echo Installing Python dependencies with UV...
uv sync
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend setup complete!
echo.

echo Setting up frontend...
cd ..\frontend
echo Installing Node.js dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend setup complete!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the application:
echo 1. Backend: cd backend && uv run python main.py
echo 2. Frontend: cd frontend && npm start
echo.
echo The backend will run on http://localhost:8000
echo The frontend will run on http://localhost:3000
echo.
pause
