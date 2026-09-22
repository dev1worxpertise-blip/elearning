@echo off
title Initialize Worxpertise Academy PostgreSQL Database
echo ========================================================
echo   Setting up PostgreSQL database: elearning_db
echo ========================================================
echo.

set PSQL_PATH="C:\Program Files\PostgreSQL\18\bin\psql.exe"

if not exist %PSQL_PATH% (
    echo [ERROR] psql.exe not found at %PSQL_PATH%
    echo Please run schema.sql and seed.sql using pgAdmin 4 Query Tool instead.
    pause
    exit /b 1
)

echo Executing schema.sql...
%PSQL_PATH% -U postgres -d elearning_db -f "%~dp0schema.sql"
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Schema execution encountered an error. Check password or permissions.
    pause
    exit /b 1
)

echo.
echo Executing seed.sql...
%PSQL_PATH% -U postgres -d elearning_db -f "%~dp0seed.sql"
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] Seed execution encountered an error. Check password or permissions.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   Success! Database elearning_db initialized & seeded.
echo ========================================================
echo.
pause
