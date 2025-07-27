# SASM Deployment Script
# This script will start both the backend and frontend for testing

Write-Host "🚀 Starting SASM Application Deployment..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Function to check if a port is available
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

# Check if required ports are available
if (-not (Test-Port 4004)) {
    Write-Host "⚠️  Port 4004 is already in use. Backend may not start." -ForegroundColor Yellow
}

if (-not (Test-Port 5173)) {
    Write-Host "⚠️  Port 5173 is already in use. Frontend may not start." -ForegroundColor Yellow
}

Write-Host "📦 Installing Backend Dependencies..." -ForegroundColor Cyan
Set-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Backend dependency installation failed." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Backend dependencies ready" -ForegroundColor Green

Write-Host "📦 Installing Frontend Dependencies..." -ForegroundColor Cyan
Set-Location ../frontend
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Frontend dependency installation failed." -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Frontend dependencies ready" -ForegroundColor Green

Set-Location ..

Write-Host "`n🔥 Starting Services..." -ForegroundColor Magenta
Write-Host "Backend will start on: http://localhost:4004" -ForegroundColor White
Write-Host "Frontend will start on: http://localhost:5173" -ForegroundColor White

# Start backend in background
Write-Host "`n🖥️  Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait a moment for backend to initialize
Start-Sleep -Seconds 3

# Start frontend
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "`n✨ Deployment started successfully!" -ForegroundColor Green
Write-Host "🌍 Open your browser and go to: http://localhost:5173" -ForegroundColor Yellow
Write-Host "📡 Backend API is available at: http://localhost:4004" -ForegroundColor Yellow
Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
