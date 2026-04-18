# CLI Setup

The CLI is already in this repository at `FounderOS/cli`. No manual file relocation is required.

## Structure

```text
FounderOS/
  cli/
    src/
      App.tsx
      bin/founder.tsx
      commands/
      lib/
    package.json
    tsconfig.json
    vitest.config.ts
```

## Install and build

From `FounderOS/cli`:

```bash
pnpm install
pnpm build
```

## Run locally

```bash
node dist/bin/founder.js
node dist/bin/founder.js help
```

## Link globally

From `FounderOS/cli`:

```bash
npm link
founder help
```

## Verify commands

```bash
founder
founder help
founder new
founder validate
founder roadmap
founder list
founder show <idea-id>
founder delete <idea-id>
```

## Data location

Local data is stored in:

- `~/.founder/ideas/*.json`
- `~/.founder/*-ROADMAP.md`
- `~/.founder/config.json`

For tests or isolated runs, override storage root with:

```bash
FOUNDER_HOME=/tmp/founder-dev node dist/bin/founder.js list
```
