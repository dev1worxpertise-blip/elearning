@echo off
title Worxpertise Academy Backend API Server
echo ========================================================
echo   Starting Worxpertise Academy REST API Server
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if Node is available in PATH or Program Files
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
    echo Server stopped or encountered an error.
)
pause
