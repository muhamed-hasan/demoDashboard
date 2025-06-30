@echo off
echo Installing Attendance Dashboard as Windows Service...
echo.

REM Check if NSSM is installed
where nssm >nul 2>nul
if %errorlevel% neq 0 (
    echo NSSM is not installed. Please install NSSM first.
    echo Download from: https://nssm.cc/download
    pause
    exit /b 1
)

REM Get the current directory
set PROJECT_DIR=%~dp0
set NODE_PATH=node
set SCRIPT_PATH=%PROJECT_DIR%start-service.ps1

REM Install the service
echo Installing service...
nssm install "AttendanceDashboard" "powershell.exe" "-ExecutionPolicy Bypass -File \"%SCRIPT_PATH%\""
nssm set "AttendanceDashboard" AppDirectory "%PROJECT_DIR%"
nssm set "AttendanceDashboard" Description "Attendance Dashboard Service"
nssm set "AttendanceDashboard" Start SERVICE_AUTO_START

REM Set environment variables
nssm set "AttendanceDashboard" AppEnvironmentExtra NODE_ENV=production
nssm set "AttendanceDashboard" AppEnvironmentExtra PORT=3000

echo.
echo Service installed successfully!
echo Service name: AttendanceDashboard
echo.
echo To start the service: net start AttendanceDashboard
echo To stop the service: net stop AttendanceDashboard
echo To remove the service: nssm remove AttendanceDashboard confirm
echo.
pause 