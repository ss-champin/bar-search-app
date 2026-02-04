# # Bar Search App - Development Environment Setup Script
# # Execute with PowerShell

# $ErrorActionPreference = "Stop"

# Write-Host "========================================" -ForegroundColor Cyan
# Write-Host "Bar Search App - Development Setup" -ForegroundColor Cyan
# Write-Host "========================================" -ForegroundColor Cyan
# Write-Host ""

# # Check admin privileges
# $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# if (-not $isAdmin) {
#     Write-Host "This script is running without admin privileges" -ForegroundColor Yellow
#     Write-Host "Using Scoop (no admin required)" -ForegroundColor Yellow
#     Write-Host ""
# }

# # ========================================
# # 1. Install Scoop
# # ========================================
# Write-Host "[1/5] Checking Scoop installation..." -ForegroundColor Green

# $scoopInstalled = Get-Command scoop -ErrorAction SilentlyContinue

# if (-not $scoopInstalled) {
#     Write-Host "   Scoop not found. Installing..." -ForegroundColor Yellow

#     # Set ExecutionPolicy
#     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

#     # Install Scoop
#     Write-Host "   Downloading Scoop..." -ForegroundColor Cyan
#     Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

#     if ($LASTEXITCODE -eq 0 -or (Get-Command scoop -ErrorAction SilentlyContinue)) {
#         Write-Host "   [OK] Scoop installed successfully" -ForegroundColor Green
#     } else {
#         Write-Host "   [ERROR] Failed to install Scoop" -ForegroundColor Red
#         Write-Host "   Please install manually: https://scoop.sh" -ForegroundColor Red
#         exit 1
#     }
# } else {
#     Write-Host "   [OK] Scoop is already installed" -ForegroundColor Green
# }

# # Update Scoop
# Write-Host "   Updating Scoop..." -ForegroundColor Cyan
# scoop update | Out-Null

# # ========================================
# # 2. Install go-task
# # ========================================
# Write-Host ""
# Write-Host "[2/5] Installing go-task..." -ForegroundColor Green

# $taskInstalled = Get-Command task -ErrorAction SilentlyContinue

# if (-not $taskInstalled) {
#     Write-Host "   Installing go-task..." -ForegroundColor Yellow
#     scoop install task

#     if ($LASTEXITCODE -eq 0 -or (Get-Command task -ErrorAction SilentlyContinue)) {
#         Write-Host "   [OK] go-task installed successfully" -ForegroundColor Green
#     } else {
#         Write-Host "   [ERROR] Failed to install go-task" -ForegroundColor Red
#         exit 1
#     }
# } else {
#     Write-Host "   [OK] go-task is already installed" -ForegroundColor Green
# }

# # Check version
# $taskVersion = & task --version 2>&1
# Write-Host "   Installed version: $taskVersion" -ForegroundColor Cyan

# # ========================================
# # 3. Check PATH environment variable
# # ========================================
# Write-Host ""
# Write-Host "[3/5] Checking PATH environment variable..." -ForegroundColor Green

# # Get Scoop path
# $scoopPath = "$env:USERPROFILE\scoop\shims"
# $currentUserPath = [Environment]::GetEnvironmentVariable("Path", "User")

# if (-not $currentUserPath) {
#     $currentUserPath = ""
# }

# if ($currentUserPath -notlike "*$scoopPath*") {
#     Write-Host "   Adding Scoop to user PATH..." -ForegroundColor Yellow
#     if ($currentUserPath) {
#         [Environment]::SetEnvironmentVariable("Path", "$currentUserPath;$scoopPath", "User")
#     } else {
#         [Environment]::SetEnvironmentVariable("Path", $scoopPath, "User")
#     }
#     Write-Host "   [OK] Added Scoop to PATH" -ForegroundColor Green
# } else {
#     Write-Host "   [OK] PATH is correctly configured" -ForegroundColor Green
# }

# # Update current session PATH
# $env:Path = "$env:Path;$scoopPath"

# # ========================================
# # 4. Check Docker installation
# # ========================================
# Write-Host ""
# Write-Host "[4/5] Checking Docker installation..." -ForegroundColor Green

# $dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

# if (-not $dockerInstalled) {
#     Write-Host "   [WARNING] Docker is not installed" -ForegroundColor Yellow
#     Write-Host "   Please install Docker Desktop manually:" -ForegroundColor Yellow
#     Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
# } else {
#     $dockerVersion = & docker --version 2>&1
#     Write-Host "   [OK] Docker installed: $dockerVersion" -ForegroundColor Green

#     # Check Docker Compose
#     $composeCheck = & docker compose version 2>&1
#     if ($LASTEXITCODE -eq 0) {
#         Write-Host "   [OK] Docker Compose available" -ForegroundColor Green
#     }
# }

# # ========================================
# # 5. Project setup
# # ========================================
# Write-Host ""
# Write-Host "[5/5] Setting up project..." -ForegroundColor Green

# # Create .env file
# if (-not (Test-Path ".env")) {
#     if (Test-Path ".env.example") {
#         Copy-Item ".env.example" ".env"
#         Write-Host "   [OK] Created .env file" -ForegroundColor Green
#     } else {
#         Write-Host "   [WARNING] .env.example not found" -ForegroundColor Yellow
#     }
# } else {
#     Write-Host "   [OK] .env file already exists" -ForegroundColor Green
# }

# # ========================================
# # Setup complete
# # ========================================
# Write-Host ""
# Write-Host "========================================" -ForegroundColor Cyan
# Write-Host "[OK] Setup Complete!" -ForegroundColor Green
# Write-Host "========================================" -ForegroundColor Cyan
# Write-Host ""

# # Next steps
# Write-Host "Next Steps:" -ForegroundColor Yellow
# Write-Host ""
# Write-Host "1. Open a new PowerShell session (to apply PATH changes)" -ForegroundColor White
# Write-Host ""
# Write-Host "2. Start development environment:" -ForegroundColor White
# Write-Host "   task build" -ForegroundColor Cyan
# Write-Host "   task up" -ForegroundColor Cyan
# Write-Host "   task db:migrate" -ForegroundColor Cyan
# Write-Host ""
# Write-Host "3. Access:" -ForegroundColor White
# Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor Cyan
# Write-Host "   Backend:   http://localhost:8000/docs" -ForegroundColor Cyan
# Write-Host ""
# Write-Host "Available commands:" -ForegroundColor White
# Write-Host "   task help" -ForegroundColor Cyan
# Write-Host ""

# # Docker warning
# if (-not $dockerInstalled) {
#     Write-Host "[IMPORTANT] Please install Docker!" -ForegroundColor Red
#     Write-Host "   https://www.docker.com/products/docker-desktop" -ForegroundColor Cyan
#     Write-Host ""
# }

# Write-Host "Setup script completed." -ForegroundColor Green
# Write-Host ""

# # Prompt for PowerShell restart
# Write-Host "Please close this PowerShell window and open a new one." -ForegroundColor Yellow
# Write-Host "Then run 'task --version' to verify installation." -ForegroundColor Cyan
# Write-Host ""

# Read-Host "Press Enter to exit"
