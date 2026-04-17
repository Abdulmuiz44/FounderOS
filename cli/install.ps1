# FounderOS CLI Installation Script for Windows
# This script builds and links the 'founder' command globally.

$ErrorActionPreference = "Stop"

Write-Host "✦ Installing FounderOS CLI..." -ForegroundColor Cyan

# Check for pnpm or npm
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $manager = "pnpm"
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $manager = "npm"
} else {
    Write-Error "Node.js and npm/pnpm are required. Please install them first."
}

Write-Host "Using $manager to install dependencies..."
& $manager install

Write-Host "Building project..."
& $manager run build

Write-Host "Linking command globally..."
& $manager link --force

Write-Host "`n✓ FounderOS CLI installed successfully!" -ForegroundColor Green
Write-Host "You can now run 'founder' from anywhere in your terminal." -ForegroundColor White
Write-Host "`nCommands:"
Write-Host "  founder new       - Capture a new idea"
Write-Host "  founder validate  - Score an idea"
Write-Host "  founder roadmap   - Generate MVP roadmap"
