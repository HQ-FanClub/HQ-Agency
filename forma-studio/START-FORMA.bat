@echo off
setlocal
cd /d "%~dp0"
title FORMA Studio - Local Designer Engine
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Install Node 20+ from https://nodejs.org
  pause
  exit /b 1
)
echo Starting FORMA Studio on http://localhost:3210
echo Leave this window open while using FORMA.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3210'"
node server.cjs
echo.
echo FORMA server stopped. Close this window or restart START-FORMA.bat.
pause
