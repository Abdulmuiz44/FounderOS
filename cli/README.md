# FounderOS CLI

Local-first terminal tooling for capturing, validating, and roadmapping startup ideas.

## What it does

- `founder` opens the interactive menu
- `founder new` captures a new idea
- `founder validate` scores an idea and persists validation into JSON
- `founder roadmap` exports markdown and persists roadmap metadata into JSON
- `founder list` shows saved ideas
- `founder show <idea-id>` shows full idea details
- `founder delete <idea-id>` deletes an idea after confirmation

All CLI data stays local under `~/.founder/` by default.

## Install

From `FounderOS/cli`:

```bash
pnpm install
pnpm build
npm link
```

Then run:

```bash
founder help
```

## Run without linking

From `FounderOS/cli`:

```bash
pnpm install
pnpm build
node dist/bin/founder.js help
```

## Command help

```bash
founder --help
founder new --help
founder validate --help
founder roadmap --help
founder list --help
founder show --help
founder delete --help
```

## Storage model

Ideas are saved as JSON files in `~/.founder/ideas/`.

Each idea can include:

- core idea fields
- `validation`
- `roadmap`
- `updatedAt`

Roadmap markdown exports are written to:

- `~/.founder/<idea-id>-ROADMAP.md`

Roadmap JSON metadata includes:

- `generatedAt`
- `estimatedTotalWeeks`
- `phases`
- `markdownPath`

## Scripts

From `FounderOS/cli`:

```bash
pnpm dev
pnpm test
pnpm build
pnpm start
pnpm link:local
```

## Test

```bash
pnpm test
```

## Notes

- CLI is local-first; no auth or cloud sync is part of this package yet.
- For deterministic tests, set `FOUNDER_HOME` to a temp directory.
