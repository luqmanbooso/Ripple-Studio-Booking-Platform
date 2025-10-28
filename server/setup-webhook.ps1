# PayHere Webhook Setup Script for Windows PowerShell

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  🚀 PayHere Webhook Setup Assistant" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Check if ngrok is installed
Write-Host "Checking ngrok installation..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok is not installed`n" -ForegroundColor Red
    Write-Host "Installing ngrok..." -ForegroundColor Yellow
    Write-Host "You can install it using one of these methods:`n" -ForegroundColor White
    
    Write-Host "Method 1: Using npm (recommended)" -ForegroundColor Cyan
    Write-Host "  npm install -g ngrok`n" -ForegroundColor White
    
    Write-Host "Method 2: Using Chocolatey" -ForegroundColor Cyan
    Write-Host "  choco install ngrok`n" -ForegroundColor White
    
    Write-Host "Method 3: Download directly" -ForegroundColor Cyan
    Write-Host "  Visit: https://ngrok.com/download`n" -ForegroundColor White
    
    $install = Read-Host "Would you like to install using npm? (y/n)"
    
    if ($install -eq "y") {
        npm install -g ngrok
        Write-Host "`n✅ ngrok installed successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "`nPlease install ngrok manually and run this script again." -ForegroundColor Yellow
        exit
    }
}

Write-Host "✅ ngrok is installed`n" -ForegroundColor Green

# Get current server port
$envPath = Join-Path $PSScriptRoot ".env"
$port = 5000

if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $portLine = $envContent | Where-Object { $_ -match "^PORT=" }
    if ($portLine) {
        $port = ($portLine -split "=")[1]
    }
}

Write-Host "Server port: $port`n" -ForegroundColor Cyan

# Instructions
Write-Host "📝 Setup Instructions:" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Yellow

Write-Host "Step 1: Start your server in one terminal" -ForegroundColor Cyan
Write-Host "  npm run dev`n" -ForegroundColor White

Write-Host "Step 2: Start ngrok in another terminal (keep it running)" -ForegroundColor Cyan
Write-Host "  ngrok http $port`n" -ForegroundColor White

Write-Host "Step 3: Copy the https forwarding URL from ngrok" -ForegroundColor Cyan
Write-Host "  Example: https://abc123-456-789.ngrok-free.app`n" -ForegroundColor White

Write-Host "Step 4: Update your .env file" -ForegroundColor Cyan
Write-Host "  SERVER_URL=https://your-ngrok-url`n" -ForegroundColor White

Write-Host "Step 5: Update PayHere Dashboard" -ForegroundColor Cyan
Write-Host "  1. Login to https://www.payhere.lk/merchant" -ForegroundColor White
Write-Host "  2. Go to Settings > Domains & Credentials" -ForegroundColor White
Write-Host "  3. Find API Configuration section" -ForegroundColor White
Write-Host "  4. Set Notify URL: https://your-ngrok-url/api/webhooks/payhere" -ForegroundColor White
Write-Host "  5. Save changes`n" -ForegroundColor White

Write-Host "Step 6: Restart your server" -ForegroundColor Cyan
Write-Host "  Stop the server (Ctrl+C) and run: npm run dev`n" -ForegroundColor White

Write-Host "============================================================`n" -ForegroundColor Yellow

# Offer to start ngrok
$startNgrok = Read-Host "Would you like to start ngrok now? (y/n)"

if ($startNgrok -eq "y") {
    Write-Host "`n🚀 Starting ngrok...`n" -ForegroundColor Green
    Write-Host "Keep this window open! Your webhook URL will be shown below." -ForegroundColor Yellow
    Write-Host "Copy the https URL and update your .env and PayHere dashboard.`n" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop ngrok when done.`n" -ForegroundColor White
    
    Start-Sleep -Seconds 2
    ngrok http $port
} else {
    Write-Host "`n💡 Remember to start ngrok manually:" -ForegroundColor Yellow
    Write-Host "   ngrok http $port`n" -ForegroundColor White
    
    Write-Host "Then update your .env file with the ngrok URL" -ForegroundColor Yellow
    Write-Host "and configure it in your PayHere dashboard.`n" -ForegroundColor Yellow
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Setup complete! Check WEBHOOK-TROUBLESHOOTING.md for help" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan
