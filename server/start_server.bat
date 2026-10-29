@echo off
title Worxpertise Academy Backend API Server
echo ========================================================
echo   Starting Worxpertise Academy REST API Server
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Ensure PostgreSQL is active before launching Node
netstat -ano | findstr :5432 >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] PostgreSQL is offline. Attempting to start PostgreSQL...
    if exist "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" (
        "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" start -D "C:\Program Files\PostgreSQL\18\data" -w -t 15
    )
)

:: 2. Check if Node is available in PATH or Program Files
set NODE_EXE=node
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set NODE_EXE="C:\Program Files\nodejs\node.exe"
    )
)

echo Starting Node.js server...
%NODE_EXE% server.js

if %errorlevel% neq 0 (
    echo.
    echo ========================================================
    echo   [ERROR] Node.js server stopped or encountered an error.
    echo   Please check if PostgreSQL is running and port 5000 is free.
    echo ========================================================
    pause
)
