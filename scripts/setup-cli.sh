#!/bin/bash
# This script sets up the FounderOS CLI scaffold in the repository root

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up FounderOS CLI scaffold...${NC}"

# Create directories
mkdir -p ../cli/src/commands
mkdir -p ../cli/src/ui/components
mkdir -p ../cli/src/lib
mkdir -p ../cli/src/utils
mkdir -p ../cli/bin
mkdir -p ../cli/dist

echo -e "${GREEN}✓ Directory structure created${NC}"

# Create package.json
cat > ../cli/package.json << 'EOF'
{
  "name": "@founderos/cli",
  "version": "0.1.0",
  "description": "FounderOS CLI - Local-first startup idea validation and roadmapping",
  "type": "module",
  "bin": {
    "founder": "./dist/bin/founder.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "founder": "tsx src/bin/founder.ts",
    "founder:build": "node dist/bin/founder.js",
    "clean": "rm -rf dist",
    "prebuild": "pnpm clean"
  },
  "keywords": [
    "cli",
    "startup",
    "founder",
    "idea-validation",
    "terminal-ui"
  ],
  "author": "FounderOS Team",
  "license": "ISC",
  "dependencies": {
    "ink": "^5.0.1",
    "ink-select-input": "^5.0.0",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^5.0.0",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.19.7",
    "typescript": "^5.7.3",
    "tsx": "^4.7.0"
  }
}
EOF

echo -e "${GREEN}✓ package.json created${NC}"
