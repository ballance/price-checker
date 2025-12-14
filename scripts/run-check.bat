@echo off
REM ###########################################################################
REM Price Checker - Automated Run Script (Windows)
REM
REM This script is designed to be run by Task Scheduler or manually.
REM It handles logging, error reporting, and provides a clean execution environment.
REM
REM Usage:
REM   scripts\run-check.bat
REM
REM Task Scheduler Example:
REM   Program: cmd.exe
REM   Arguments: /c "C:\path\to\price-checker\scripts\run-check.bat"
REM
REM ###########################################################################

REM Get the directory where this script is located
SET SCRIPT_DIR=%~dp0
SET PROJECT_DIR=%SCRIPT_DIR%..

REM Configuration
SET LOG_DIR=%PROJECT_DIR%\logs
SET LOG_FILE=%LOG_DIR%\cron.log
SET ERROR_LOG=%LOG_DIR%\error.log
SET STATUS_LOG=%LOG_DIR%\status.log

REM Create logs directory if it doesn't exist
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

REM Function to log with timestamp
call :log "========================================="
call :log "Starting price check"
call :log "Project directory: %PROJECT_DIR%"

REM Change to project directory
cd /d "%PROJECT_DIR%"

REM Check if node_modules exists
if not exist "node_modules" (
    call :log_error "node_modules not found. Running npm install..."
    npm install >> "%LOG_FILE%" 2>&1
    if errorlevel 1 goto :error
)

REM Run the price check
call :log "Running npm run check..."
npm run check >> "%LOG_FILE%" 2>&1
if errorlevel 1 goto :error

REM Log success
call :log "Price check completed successfully"
echo Success: %date% %time% >> "%STATUS_LOG%"

call :log "========================================="
exit /b 0

REM ===== FUNCTIONS =====

:log
echo [%date% %time%] %~1 >> "%LOG_FILE%"
echo [%date% %time%] %~1
exit /b 0

:log_error
echo [%date% %time%] ERROR: %~1 >> "%ERROR_LOG%"
echo [%date% %time%] ERROR: %~1
exit /b 0

:error
call :log_error "Script failed"
echo Failed: %date% %time% >> "%STATUS_LOG%"
exit /b 1
