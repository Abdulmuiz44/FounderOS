#!/bin/bash
# CLI Scaffold Setup Script
# Run from FounderOS/ directory

set -e

echo "🚀 Setting up FounderOS CLI scaffold..."

# Create the cli directory structure
mkdir -p cli/src/commands
mkdir -p cli/src/lib
mkdir -p cli/src/utils
mkdir -p cli/bin
mkdir -p cli/dist

echo "✓ Directory structure created"

# Move files into place
mv cli-package.json cli/package.json
mv cli-tsconfig.json cli/tsconfig.json
mv cli-README.md cli/README.md
mv cli-gitignore cli/.gitignore
mv cli-src-index.ts cli/src/index.ts
mv cli-src-App.tsx cli/src/App.tsx
mv cli-src-lib-cli-types.ts cli/src/lib/cli-types.ts
mv cli-src-lib-storage.ts cli/src/lib/storage.ts
mv cli-src-lib-scoring.ts cli/src/lib/scoring.ts
mv cli-src-lib-roadmap-gen.ts cli/src/lib/roadmap-gen.ts
mv cli-src-commands-new.tsx cli/src/commands/new.tsx
mv cli-src-commands-validate.tsx cli/src/commands/validate.tsx
mv cli-src-commands-roadmap.tsx cli/src/commands/roadmap.tsx
mv cli-bin-founder.ts cli/bin/founder.ts

echo "✓ Files organized"

# Make bin executable
chmod +x cli/bin/founder.ts

echo "✓ CLI scaffold ready!"
echo ""
echo "Next steps:"
echo "  1. cd cli"
echo "  2. pnpm install"
echo "  3. pnpm build"
echo "  4. pnpm founder"
