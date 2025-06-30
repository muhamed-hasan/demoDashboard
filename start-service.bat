@echo off
echo Starting Attendance Dashboard Service...
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the project
echo Building the project...
npm run build

REM Start the service with PM2
echo Starting service with PM2...
pm2 start ecosystem.config.js --env production

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
echo.
pause 