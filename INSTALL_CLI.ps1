# FounderOS CLI Installation & Setup for Windows (PowerShell)
# Run this script from the repository root (where the 'FounderOS' directory is located)

$ErrorActionPreference = "Continue"

Write-Host "------------------------------------------------------------"
Write-Host "       FounderOS CLI Setup & Installation Guide (Windows)   "
Write-Host "------------------------------------------------------------"

# Step 1: Verify prerequisites
Write-Host "Step 1: Checking prerequisites..."

if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed"
    Write-Host "   Install from: https://nodejs.org/"
    exit 1
}

if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "WARNING: pnpm is not installed, installing globally..."
    npm install -g pnpm
}

Write-Host "OK: Prerequisites checked"
Write-Host "   Node: $(node --version)"
Write-Host "   pnpm: $(pnpm --version)"

# Step 2: Check current directory
Write-Host "Step 2: Verifying directory structure..."

if (!(Test-Path "FounderOS")) {
    Write-Host "ERROR: Must run this script from the FounderOS repository root"
    Write-Host "   Current directory: $(Get-Location)"
    exit 1
}

Write-Host "OK: In correct directory"

# Step 3: Create CLI directory structure
Write-Host "Step 3: Creating CLI directory structure..."

$cliDir = "FounderOS\cli"
$null = New-Item -ItemType Directory -Force -Path "$cliDir\src\commands"
$null = New-Item -ItemType Directory -Force -Path "$cliDir\src\lib"
$null = New-Item -ItemType Directory -Force -Path "$cliDir\src\utils"
$null = New-Item -ItemType Directory -Force -Path "$cliDir\src\bin"
$null = New-Item -ItemType Directory -Force -Path "$cliDir\dist"

Write-Host "OK: Directory structure created"

# Step 4: Organizing CLI files
Write-Host "Step 4: Organizing CLI files..."

$sourceDir = "FounderOS"

function Move-CliFile($src, $dest) {
    $actualSrc = "$sourceDir\$src"
    $actualDest = "$cliDir\$dest"
    
    # Try multiple source locations
    $sources = @($actualSrc, "$cliDir\$src")
    
    foreach ($s in $sources) {
        if (Test-Path $s) {
            Move-Item -Path $s -Destination $actualDest -Force
            Write-Host "   Moved $s to $dest"
            return
        }
    }
    Write-Host "   Skipped $src (not found)"
}

# Root configuration files
Move-CliFile "cli-package.json" "package.json"
Move-CliFile "cli-tsconfig.json" "tsconfig.json"
Move-CliFile "cli-README.md" "README.md"
Move-CliFile "cli-gitignore" ".gitignore"

# Source files
Move-CliFile "cli-src-index.ts" "src\index.tsx"
Move-CliFile "src\index.ts" "src\index.tsx"
Move-CliFile "src\index.tsx" "src\index.tsx"
Move-CliFile "cli-src-App.tsx" "src\App.tsx"

Move-CliFile "cli-src-lib-cli-types.ts" "src\lib\cli-types.ts"
Move-CliFile "cli-src-lib-storage.ts" "src\lib\storage.ts"
Move-CliFile "cli-src-lib-scoring.ts" "src\lib\scoring.ts"
Move-CliFile "cli-src-lib-roadmap-gen.ts" "src\lib\roadmap-gen.ts"

# Command files
Move-CliFile "cli-src-commands-new.tsx" "src\commands\new.tsx"
Move-CliFile "cli-src-commands-validate.tsx" "src\commands\validate.tsx"
Move-CliFile "cli-src-commands-roadmap.tsx" "src\commands\roadmap.tsx"

# Binary file
Move-CliFile "cli-bin-founder.ts" "src\bin\founder.tsx"
Move-CliFile "bin\founder.ts" "src\bin\founder.tsx"
Move-CliFile "bin\founder.tsx" "src\bin\founder.tsx"

Write-Host "OK: Files organized"

# Step 5: Install dependencies
Write-Host "Step 5: Installing CLI dependencies..."
Push-Location "$cliDir"
pnpm install
Pop-Location
Write-Host "OK: Dependencies installed"

# Step 6: Build TypeScript
Write-Host "Step 6: Building TypeScript..."

Push-Location "$cliDir"
$packagePath = "package.json"
$packageContent = Get-Content $packagePath -Raw | ConvertFrom-Json
$packageContent.scripts.dev = "tsx watch src/index.tsx"
$packageContent.scripts.founder = "tsx src/bin/founder.tsx"
$packageContent.scripts.clean = 'node -e "const fs = require(''fs''); if (fs.existsSync(''dist'')) fs.rmSync(''dist'', { recursive: true, force: true });"'
$packageContent | ConvertTo-Json -Depth 10 | Set-Content $packagePath

$tsconfigPath = "tsconfig.json"
$tsconfigContent = Get-Content $tsconfigPath -Raw | ConvertFrom-Json
$tsconfigContent.compilerOptions.module = "NodeNext"
$tsconfigContent.compilerOptions.moduleResolution = "NodeNext"
$tsconfigContent.compilerOptions | Add-Member -MemberType NoteProperty -Name "rootDir" -Value "./src" -Force
$tsconfigContent.compilerOptions | Add-Member -MemberType NoteProperty -Name "noImplicitAny" -Value $false -Force
$tsconfigContent.include = @("src/**/*.ts", "src/**/*.tsx")
$tsconfigContent | ConvertTo-Json -Depth 10 | Set-Content $tsconfigPath

pnpm build
Pop-Location
Write-Host "OK: TypeScript compiled"

# Step 7: Verify installation
Write-Host "Step 7: Verifying installation..."
if (!(Test-Path "$cliDir\dist\bin\founder.js")) {
    Write-Host "ERROR: Build verification failed: $cliDir\dist\bin\founder.js not found"
} else {
    Write-Host "OK: Build verified"
}

Write-Host "------------------------------------------------------------"
Write-Host "   FounderOS CLI Setup Complete!                            "
Write-Host "------------------------------------------------------------"
Write-Host "Run the CLI:"
Write-Host "  node $cliDir\dist\bin\founder.js"
