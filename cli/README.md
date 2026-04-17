# FounderOS CLI

A local-first terminal UI for capturing, validating, and roadmapping startup ideas. Built with TypeScript and Ink.

## Features

- **founder new** - Capture startup ideas interactively
- **founder validate** - Score ideas using a transparent validation framework
- **founder roadmap** - Generate 3-phase MVP roadmaps
- **Local-first** - All data stored in `~/.founder/`
- **Offline-capable** - No internet required for core functionality
- **TypeScript + Ink** - Type-safe, responsive terminal UI

## Installation (Windows)

The easiest way to install on Windows is using the provided PowerShell script:

```powershell
# In the FounderOS/cli directory
.\install.ps1
```

This script will:
1. Install dependencies
2. Build the TypeScript project
3. Link the `founder` command globally

## Manual Installation

```bash
# In the FounderOS/cli directory
npm install
npm run build
npm link
```

## Quick Start

```bash
# Create a new idea
founder new

# Validate an idea
founder validate

# Generate a roadmap
founder roadmap
```

## Data Storage

All data is stored locally in your home directory at `~/.founder/`:

- **Ideas**: `~/.founder/ideas/*.json`
- **Roadmaps**: `~/.founder/*-ROADMAP.md`
- **Config**: `~/.founder/config.json`

## Commands

### founder new
Interactively capture a new startup idea (Title, Problem, Target User, Differentiator).

### founder validate
Score an idea across 7 critical dimensions:
- **Pain Intensity** (20%)
- **Willingness to Pay** (20%)
- **Urgency** (15%)
- **Founder Advantage** (15%)
- **Target User Clarity** (10%)
- **Competition Saturation** (10%)
- **Distribution Difficulty** (10%)

### founder roadmap
Generate a 3-phase MVP roadmap (Discovery, Build, Polish) based on your validated idea.

## Testing

Run the automated test suite for scoring and core logic:

```bash
npm test
```

## Development

```bash
# Run in watch mode
npm run dev

# Build TypeScript
npm run build

# Run CLI locally without linking
node dist/bin/founder.js
```

## License
ISC
