@echo off
title LearnPulse E-Learning Platform
echo ===================================================
echo   Launching LearnPulse Video E-Learning Platform...
echo ===================================================
echo.
echo Opening index.html in your default web browser...
start "" "%~dp0index.html"
echo.
echo Platform is now running in your browser!
echo (You can close this command window anytime)
timeout /t 3 >nul
exit
