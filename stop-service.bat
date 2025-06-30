@echo off
echo Stopping Attendance Dashboard Service...
echo.

REM Stop the service
pm2 stop attendance-dashboard

REM Delete the service from PM2
pm2 delete attendance-dashboard

REM Save PM2 configuration
pm2 save

echo.
echo Service stopped successfully!
echo.
pause 