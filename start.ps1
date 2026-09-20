$nodeCmd = Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $nodeCmd) {
    $cursorNode = "$env:LOCALAPPDATA\Programs\cursor\resources\app\resources\helpers\node.exe"
    if (Test-Path $cursorNode) {
        $nodeCmd = $cursorNode
    } elseif (Test-Path "C:\Program Files\nodejs\node.exe") {
        $nodeCmd = "C:\Program Files\nodejs\node.exe"
    } else {
        Write-Error "Node.js was not found. Please install Node.js from https://nodejs.org/"
        return
    }
}

Write-Host "Starting Hatch server..." -ForegroundColor Cyan
Write-Host "Customer site:    http://localhost:3001" -ForegroundColor Green
Write-Host "Admin dashboard:  http://localhost:3001/admin (user: hatch / password: changeme)" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server.`n"

Start-Process "http://localhost:3001"
& $nodeCmd "$PSScriptRoot\server.js"
