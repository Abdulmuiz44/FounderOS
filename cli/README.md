# FounderOS CLI

Local-first terminal tooling for capturing, validating, and roadmapping startup ideas.

## What it does

- `founder` opens the interactive menu
- `founder new` captures a new idea (interactive or flags)
- `founder validate` scores an idea (interactive or flags)
- `founder roadmap` exports markdown and persists roadmap metadata into JSON
- `founder list` shows saved ideas
- `founder show <idea-id>` shows full idea details
- `founder delete <idea-id>` deletes an idea after confirmation
- `founder export --path <file.json>` exports local data
- `founder import --path <file.json>` imports local data with collision handling

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
founder export --help
founder import --help
```

## Automation flags

Use non-interactive mode for scripts:

```bash
founder new --title "Idea" --problem "Problem" --target-user "User" --differentiator "Edge"
founder validate <idea-id> --pain-intensity 8 --urgency 7 --target-user-clarity 8 --willingness-to-pay 7 --competition-saturation 3 --distribution-difficulty 4 --founder-advantage 8
founder roadmap <idea-id>
```

Use `--json` with `new`, `validate`, `roadmap`, `list`, `show`, `export`, and `import` for machine-readable output.

## Storage model

Ideas are saved as JSON files in `~/.founder/ideas/`.

Each idea record now includes `schemaVersion` and can include:

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

Older idea files are automatically migrated on read to the latest schema.

## Import / Export

```bash
founder export --path ./ideas-backup.json
founder import --path ./ideas-backup.json --mode skip
founder import --path ./ideas-backup.json --mode overwrite
founder import --path ./ideas-backup.json --mode rename
```

`--mode` options:

- `skip`: keep existing idea when ids collide
- `overwrite`: replace existing idea with imported record
- `rename`: import with a new generated id

## Scripts

From `FounderOS/cli`:

```bash
pnpm dev
pnpm test
pnpm build
pnpm start
pnpm link:local
```

## Notes

- CLI is local-first; no auth or cloud sync is part of this package yet.
- For deterministic tests, set `FOUNDER_HOME` to a temp directory.
