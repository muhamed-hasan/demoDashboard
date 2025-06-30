# PowerShell script to start the attendance dashboard service
param(
    [string]$ProjectPath = $PSScriptRoot
)

Write-Host "Starting Attendance Dashboard Service..." -ForegroundColor Green

# Navigate to project directory
Set-Location $ProjectPath

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
npm run build

# Start the service
Write-Host "Starting the service..." -ForegroundColor Yellow
npm start

Write-Host "Service started successfully!" -ForegroundColor Green
Write-Host "Dashboard is running on: http://localhost:3000" -ForegroundColor Cyan 