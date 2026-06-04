$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Set-Location $ProjectRoot

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker is not installed. Install Docker Desktop from https://www.docker.com/products/docker-desktop/"
    exit 1
}

if (-not (Test-Path "$ProjectRoot\.env")) {
    Write-Host "ERROR: .env file not found. Copy .env.example to .env and fill in your keys."
    exit 1
}

Write-Host "Building and starting Prelegal..."
docker compose up --build -d

Write-Host ""
Write-Host "Prelegal is running at http://localhost:8000"
Write-Host "Run scripts\stop-windows.ps1 to stop."
