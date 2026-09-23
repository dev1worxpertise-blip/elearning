@echo off
title Worxpertise Academy - Corporate E-Learning Platform
echo ========================================================
echo   Launching Worxpertise Corporate E-Learning Platform...
echo ========================================================
echo.

:: Check if Node backend is already listening on port 5000
netstat -ano | findstr :5000 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Starting PostgreSQL REST API Server in background...
    start /min "Worxpertise Backend API" "%~dp0server\start_server.bat"
    echo [INFO] Connecting to PostgreSQL database...
    timeout /t 2 >nul
) else (
    echo [INFO] PostgreSQL REST API Server is already online on port 5000.
)

echo.
echo Opening Worxpertise Academy in your default web browser...
start "" "%~dp0index.html"
echo.
echo Platform is ready!
timeout /t 2 >nul
exit
