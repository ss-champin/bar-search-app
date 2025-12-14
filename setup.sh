#!/bin/bash
# Bar Search App - Development Environment Setup Script for Mac/Linux
# Execute with bash or zsh

set -e

echo "========================================"
echo "Bar Search App - Development Setup"
echo "========================================"
echo ""

# ========================================
# 1. Check Homebrew
# ========================================
echo "[1/4] Checking Homebrew installation..."

if ! command -v brew &> /dev/null; then
    echo "   Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH
    if [[ $(uname -m) == "arm64" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
    echo "   ✅ Homebrew installed"
else
    echo "   ✅ Homebrew already installed"
fi

# ========================================
# 2. Install go-task
# ========================================
echo ""
echo "[2/4] Installing go-task..."

if command -v task &> /dev/null; then
    echo "   ✅ go-task already installed ($(task --version))"
else
    echo "   Installing go-task via Homebrew..."
    brew install go-task/tap/go-task
    echo "   ✅ go-task installed"
fi

# ========================================
# 3. Check Docker
# ========================================
echo ""
echo "[3/4] Checking Docker installation..."

if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo "   ✅ Docker is installed and running"
    else
        echo "   ⚠️  Docker is installed but not running"
        echo "   Please start Docker Desktop and run this script again"
        exit 1
    fi
else
    echo "   ⚠️  Docker is not installed"
    echo "   Please install Docker Desktop from:"
    echo "   https://www.docker.com/products/docker-desktop"
    echo ""
    echo "   Or install via Homebrew:"
    echo "   brew install --cask docker"
    exit 1
fi

# ========================================
# 4. Create .env file
# ========================================
echo ""
echo "[4/4] Creating .env file..."

if [ -f .env ]; then
    echo "   ✅ .env file already exists"
else
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "   ✅ .env file created from .env.example"
        echo "   ⚠️  Please edit .env file and set your Supabase credentials"
    else
        echo "   ⚠️  .env.example not found. Creating basic .env file..."
        cat > .env << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Configuration
DATABASE_URL=postgresql://postgres:postgres@db:5432/bar_search_dev
SECRET_KEY=your-secret-key-here-change-in-production
EOF
        echo "   ✅ Basic .env file created"
        echo "   ⚠️  Please edit .env file and set your Supabase credentials"
    fi
fi

# ========================================
# Summary
# ========================================
echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file and set your Supabase credentials"
echo "2. Restart your terminal (or run: source ~/.zprofile)"
echo "3. Run: task build"
echo "4. Run: task up"
echo "5. Run: task db:migrate"
echo ""
echo "For more information, see SETUP_GUIDE.md"
echo ""

