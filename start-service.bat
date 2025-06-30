@echo off
echo Starting Attendance Dashboard Service...
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the project
echo Building the project...
npm run build
if errorlevel 1 (
    echo Error: Failed to build the project
    pause
    exit /b 1
)

REM Start the service with PM2
echo Starting service with PM2...
pm2 start ecosystem.config.js --env production
if errorlevel 1 (
    echo Error: Failed to start service with PM2
    pause
    exit /b 1
)

REM Save PM2 configuration
pm2 save

REM Setup PM2 to start on Windows boot
pm2 startup

echo.
echo Service started successfully!
echo Dashboard is running on: http://localhost:3000
echo.
echo To stop the service, run: pm2 stop attendance-dashboard
echo To restart the service, run: pm2 restart attendance-dashboard
echo To view logs, run: pm2 logs attendance-dashboard
echo To view status, run: pm2 status
echo.
pause 