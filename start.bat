@echo off
title GeoVision WebGIS Platform Launcher
color 0A
echo ============================================================
echo   Starting GeoVision WebGIS Platform...
echo ============================================================

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js detected. Launching local web server...
    node server.js
) else (
    echo [NOTICE] Node.js not found. Opening index.html directly in default browser...
    start index.html
)

pause
