# CLI Setup Instructions

Due to environment constraints, you'll need to manually organize the CLI files. Here's what needs to be done:

## Step 1: Create CLI Directory Structure

From the repository root (FounderOS/):

```bash
mkdir -p ../cli/src/commands
mkdir -p ../cli/src/lib
mkdir -p ../cli/src/utils
mkdir -p ../cli/bin
mkdir -p ../cli/dist
```

## Step 2: Move Files

From the `FounderOS/` directory, move these temporary files to their final locations:

**Root files:**
- `cli-package.json` → `../cli/package.json`
- `cli-tsconfig.json` → `../cli/tsconfig.json`
- `cli-README.md` → `../cli/README.md`
- `cli-gitignore` → `../cli/.gitignore`

**Source files:**
- `cli-src-index.ts` → `../cli/src/index.ts`
- `cli-src-App.tsx` → `../cli/src/App.tsx`
- `cli-src-lib-cli-types.ts` → `../cli/src/lib/cli-types.ts`
- `cli-src-lib-storage.ts` → `../cli/src/lib/storage.ts`
- `cli-src-lib-scoring.ts` → `../cli/src/lib/scoring.ts`
- `cli-src-lib-roadmap-gen.ts` → `../cli/src/lib/roadmap-gen.ts`

**Command files:**
- `cli-src-commands-new.tsx` → `../cli/src/commands/new.tsx`
- `cli-src-commands-validate.tsx` → `../cli/src/commands/validate.tsx`
- `cli-src-commands-roadmap.tsx` → `../cli/src/commands/roadmap.tsx`

**Binary file:**
- `cli-bin-founder.ts` → `../cli/bin/founder.ts`

## Step 3: Final Result

Your repository should look like:

```
FounderOS/
├── FounderOS/          (the web app)
├── cli/                (NEW!)
│   ├── src/
│   │   ├── commands/
│   │   │   ├── new.tsx
│   │   │   ├── validate.tsx
│   │   │   └── roadmap.tsx
│   │   ├── lib/
│   │   │   ├── cli-types.ts
│   │   │   ├── storage.ts
│   │   │   ├── scoring.ts
│   │   │   └── roadmap-gen.ts
│   │   ├── index.ts
│   │   └── App.tsx
│   ├── bin/
│   │   └── founder.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md
│   └── .gitignore
├── PLAN_CLI.md
└── [other files]
```

## Step 4: Install & Run

```bash
cd ../cli
pnpm install
pnpm build
node dist/bin/founder.js
```

## Verification

After setup, verify structure:
```bash
ls -la ../cli/src/
ls -la ../cli/bin/
cat ../cli/package.json
```
