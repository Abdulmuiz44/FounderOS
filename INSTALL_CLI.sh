#!/bin/bash
# FounderOS CLI Setup & Installation Guide
# This guide covers setup on all platforms: Linux, macOS, and Windows (WSL/Git Bash)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       FounderOS CLI Setup & Installation Guide             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Verify prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed"
  echo "   Install from: https://nodejs.org/"
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "⚠️  pnpm is not installed, installing globally..."
  npm install -g pnpm
fi

echo -e "${GREEN}✅ Prerequisites checked${NC}"
echo "   Node: $(node --version)"
echo "   pnpm: $(pnpm --version)"
echo ""

# Step 2: Check current directory
echo -e "${YELLOW}Step 2: Verifying directory structure...${NC}"

if [ ! -d "FounderOS" ]; then
  echo "❌ Error: Must run this script from the FounderOS repository root"
  echo "   Current directory: $(pwd)"
  exit 1
fi

echo -e "${GREEN}✅ In correct directory${NC}"
echo ""

# Step 3: Create CLI directory structure
echo -e "${YELLOW}Step 3: Creating CLI directory structure...${NC}"

mkdir -p ../cli/src/commands
mkdir -p ../cli/src/lib
mkdir -p ../cli/src/utils
mkdir -p ../cli/bin
mkdir -p ../cli/dist

echo -e "${GREEN}✅ Directory structure created${NC}"
echo ""

# Step 4: Move CLI files
echo -e "${YELLOW}Step 4: Organizing CLI files...${NC}"

cd FounderOS

# Root configuration files
mv cli-package.json ../cli/package.json
mv cli-tsconfig.json ../cli/tsconfig.json
mv cli-README.md ../cli/README.md
mv cli-gitignore ../cli/.gitignore

# Source files
mv cli-src-index.ts ../cli/src/index.ts
mv cli-src-App.tsx ../cli/src/App.tsx
mv cli-src-lib-cli-types.ts ../cli/src/lib/cli-types.ts
mv cli-src-lib-storage.ts ../cli/src/lib/storage.ts
mv cli-src-lib-scoring.ts ../cli/src/lib/scoring.ts
mv cli-src-lib-roadmap-gen.ts ../cli/src/lib/roadmap-gen.ts

# Command files
mv cli-src-commands-new.tsx ../cli/src/commands/new.tsx
mv cli-src-commands-validate.tsx ../cli/src/commands/validate.tsx
mv cli-src-commands-roadmap.tsx ../cli/src/commands/roadmap.tsx

# Binary file
mv cli-bin-founder.ts ../cli/bin/founder.ts

# Make binary executable
chmod +x ../cli/bin/founder.ts

echo -e "${GREEN}✅ Files organized${NC}"
echo ""

# Step 5: Install dependencies
echo -e "${YELLOW}Step 5: Installing CLI dependencies...${NC}"
echo "   (This may take a minute...)"
echo ""

cd ../cli
pnpm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 6: Build TypeScript
echo -e "${YELLOW}Step 6: Building TypeScript...${NC}"

pnpm build

echo -e "${GREEN}✅ TypeScript compiled${NC}"
echo ""

# Step 7: Verify installation
echo -e "${YELLOW}Step 7: Verifying installation...${NC}"

if [ ! -f "dist/bin/founder.js" ]; then
  echo "❌ Build verification failed"
  exit 1
fi

echo -e "${GREEN}✅ Build verified${NC}"
echo ""

# Success message
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}✓ FounderOS CLI Setup Complete!${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "📍 Location: $(pwd)"
echo ""

echo -e "${YELLOW}🚀 Quick Start:${NC}"
echo ""
echo "Run the CLI:"
echo -e "  ${GREEN}node dist/bin/founder.js${NC}"
echo ""
echo "Or in watch mode:"
echo -e "  ${GREEN}pnpm dev${NC}"
echo ""

echo -e "${YELLOW}📖 Available Commands:${NC}"
echo ""
echo "  founder new       - Capture a new startup idea"
echo "  founder validate  - Validate and score an idea"
echo "  founder roadmap   - Generate an MVP roadmap"
echo ""

echo -e "${YELLOW}📂 Data Storage:${NC}"
echo ""
echo "  All data is stored in: ~/.founder/"
echo "  Ideas: ~/.founder/ideas/"
echo "  Roadmaps: ~/.founder/idea_*-ROADMAP.md"
echo ""

echo -e "${YELLOW}📚 Documentation:${NC}"
echo ""
echo "  Full guide:   ../README.md"
echo "  Quick start:  CLI_QUICK_START.md"
echo "  Architecture: PLAN_CLI.md"
echo "  Setup help:   CLI_SETUP.md"
echo ""

echo -e "${YELLOW}💡 Next Steps:${NC}"
echo ""
echo "  1. Test the CLI:"
echo -e "     ${GREEN}node dist/bin/founder.js${NC}"
echo ""
echo "  2. Create your first idea:"
echo -e "     ${GREEN}founder new${NC}"
echo ""
echo "  3. Validate an idea:"
echo -e "     ${GREEN}founder validate${NC}"
echo ""
echo "  4. Generate a roadmap:"
echo -e "     ${GREEN}founder roadmap${NC}"
echo ""

echo -e "${GREEN}Happy building! 🚀${NC}"
