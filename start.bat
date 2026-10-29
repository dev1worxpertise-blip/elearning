@echo off
title Worxpertise Academy - Corporate E-Learning Platform
setlocal enabledelayedexpansion

echo ========================================================
echo   Launching Worxpertise Corporate E-Learning Platform...
echo ========================================================
echo.

:: 1. Check & Ensure PostgreSQL (port 5432) is running
netstat -ano | findstr :5432 | findstr LISTENING >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] PostgreSQL database server is offline. Starting PostgreSQL...
    if exist "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" (
        "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\18\data" -w -t 15 >nul 2>nul
    ) else (
        net start postgresql-x64-18 >nul 2>nul
    )
    ping -n 3 127.0.0.1 >nul
)

:: Re-verify PostgreSQL
netstat -ano | findstr :5432 >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL database connected on port 5432.
) else (
    echo [WARNING] PostgreSQL might still be starting up. Node server will auto-retry.
)

:: 2. Check if Node API backend (port 5000) is running
netstat -ano | findstr :5000 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Starting Node.js REST API Server in background...
    start /min "Worxpertise Backend API" cmd /c "%~dp0server\start_server.bat"
    
    :: Wait loop for port 5000 to be active (up to 12 seconds)
    echo [INFO] Waiting for API server to become ready on port 5000...
    set SERVER_READY=0
    for /l %%i in (1,1,12) do (
        if !SERVER_READY! equ 0 (
            ping -n 2 127.0.0.1 >nul
            netstat -ano | findstr :5000 >nul 2>nul
            if !errorlevel! equ 0 (
                set SERVER_READY=1
            )
        )
    )
    
    if !SERVER_READY! equ 1 (
        echo [OK] API Server is online and accepting connections!
    ) else (
        echo [WARNING] API server is taking longer than expected. Check server window if needed.
    )
) else (
    echo [INFO] PostgreSQL REST API Server is already online on port 5000.
)

echo.
echo Opening Worxpertise Academy in your default web browser...
start "" "http://localhost:5000"
echo.
echo Platform is ready at http://localhost:5000
ping -n 3 127.0.0.1 >nul
exit
