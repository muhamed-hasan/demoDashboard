@echo off
echo Starting Attendance Dashboard Service...

REM Change to the project directory
cd /d "%~dp0"

REM Build the project
echo Building the project...
call npm run build

REM Start the service using PM2
echo Starting PM2 service...
call pm2 start ecosystem.config.js

REM Show status
echo.
echo Service status:
call pm2 list

echo.
echo Service started successfully!
echo You can access the dashboard at: http://localhost:3000
echo.
echo To stop the service, run: pm2 stop attendance-dashboard
echo To restart the service, run: pm2 restart attendance-dashboard
echo To view logs, run: pm2 logs attendance-dashboard
echo.
pause 