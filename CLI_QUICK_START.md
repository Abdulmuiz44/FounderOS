# FounderOS CLI - Quick Reference

## 🚀 Setup (One Time)

### Option A: Bash/Linux/macOS

```bash
cd FounderOS
bash setup-cli.sh
cd ../cli
pnpm install
pnpm build
```

### Option B: Manual (Windows/Mac/Linux)

```bash
# From FounderOS/ directory
mkdir -p ../cli/src/commands ../cli/src/lib ../cli/bin ../cli/dist

# Move files (see CLI_SETUP.md for full list)
mv cli-package.json ../cli/package.json
mv cli-tsconfig.json ../cli/tsconfig.json
# ... (move remaining files per CLI_SETUP.md)

# Install and build
cd ../cli
pnpm install
pnpm build
```

---

## 🎯 Running the CLI

### Development Mode (watch + rebuild)
```bash
cd cli
pnpm dev
```

### Run Directly (with tsx)
```bash
cd cli
pnpm founder
```

### Run Built Version
```bash
cd cli
pnpm build
node dist/bin/founder.js
```

### Install Globally
```bash
cd cli
pnpm link --global
founder new
```

---

## 📝 Using the CLI

### Create a New Idea
```bash
founder new
```
**Prompts for:**
- Idea title
- Problem statement
- Target user
- Key differentiator

**Saves to:** `~/.founder/ideas/{id}.json`

### Validate an Idea
```bash
founder validate
```
**Prompts for:**
- Select an existing idea
- Market size (small/medium/large/massive)
- Founder fit (1-10)
- Competition intensity (1-10)
- Time to MVP (weeks)
- Funding required (USD)

**Outputs:** Score (0-100) + Risk level

### Generate a Roadmap
```bash
founder roadmap
```
**Prompts for:**
- Select a validated idea

**Outputs:** 3-phase MVP roadmap as Markdown

**Saves to:** `~/.founder/{id}-ROADMAP.md`

---

## 📂 Data Locations

All data stored locally in home directory:

```
~/.founder/
├── ideas/
│   ├── idea_1234567_abc.json
│   ├── idea_1234568_xyz.json
│   └── ...
├── config.json
└── idea_1234567_abc-ROADMAP.md
```

---

## 🛠️ Development Scripts

```bash
pnpm dev              # Watch & rebuild
pnpm build            # Compile TypeScript
pnpm start            # Run compiled version
pnpm founder          # Run with tsx
pnpm founder:build    # Run built binary
pnpm clean            # Delete dist/
```

---

## 📦 Project Structure

```
cli/
├── src/
│   ├── index.ts              # Entrypoint
│   ├── App.tsx               # Main menu
│   ├── commands/
│   │   ├── new.tsx           # Capture idea
│   │   ├── validate.tsx       # Score idea
│   │   └── roadmap.tsx        # Generate roadmap
│   └── lib/
│       ├── cli-types.ts       # Types
│       ├── storage.ts         # File I/O
│       ├── scoring.ts         # Validation logic
│       └── roadmap-gen.ts     # Roadmap logic
├── bin/
│   └── founder.ts            # Executable
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Troubleshooting

### "No ideas found"
Run `founder new` first to create an idea.

### "No validated ideas found"
Run `founder validate` to score an idea before generating roadmap.

### "pnpm: command not found"
Install pnpm: `npm install -g pnpm`

### "Module not found" errors
Rebuild TypeScript: `pnpm clean && pnpm build`

### Can't write to ~/.founder/
Check permissions:
```bash
mkdir -p ~/.founder
chmod 755 ~/.founder
```

---

## 📚 Next Steps

1. ✅ Setup CLI (follow instructions above)
2. ✅ Test `founder new`
3. ✅ Test `founder validate`
4. ✅ Test `founder roadmap`
5. 📋 Add `founder list` command
6. 📋 Add `founder show {id}` command
7. 📋 Add `founder sync` for web integration

---

## 📖 Full Documentation

- `SCAFFOLD_SUMMARY.md` - Complete overview
- `PLAN_CLI.md` - Architecture & design
- `CLI_SETUP.md` - Detailed setup guide
- `cli/README.md` - CLI-specific docs

---

## ⚡ Quick Test

After setup, test the full flow:

```bash
# Start CLI
cd cli
pnpm dev

# In another terminal or after exit, verify data
ls ~/.founder/ideas/
cat ~/.founder/ideas/*.json
```

Expected output: One JSON file with your idea data.

---

## 📞 Questions?

See `SCAFFOLD_SUMMARY.md` for detailed Q&A and troubleshooting.
