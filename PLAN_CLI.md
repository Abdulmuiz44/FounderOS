# FounderOS CLI Architecture & Plan

## Overview

Add a local-first, terminal-based CLI to help founders capture, validate, and roadmap startup ideas. The CLI complements the web dashboard by enabling offline workflows and quick iterations.

**MVP Scope**: `founder new`, `founder validate`, `founder roadmap`

## Design Principles

1. **Local-first**: No required internet, no required auth (initially)
2. **Composable**: Small, single-responsibility commands
3. **Ink-based UI**: Rich terminal UX, React-style components
4. **TypeScript**: Type-safe, consistent with web app
5. **Shareable Logic**: Reuse validation, scoring, and roadmap generation from the web app
6. **Progressive Enhancement**: Can sync to web later, but works offline now

## Commands (MVP)

### `founder new`
Capture a new startup idea interactively.

**Flow**:
1. Prompt for idea title
2. Prompt for problem statement
3. Prompt for target user
4. Prompt for key differentiator
5. Auto-save to `~/.founder/ideas/{id}.json`
6. Display success with file path and next steps

**Output**: JSON file with idea metadata, timestamps

### `founder validate`
Score an idea against structured heuristics.

**Flow**:
1. List available ideas (or accept path arg)
2. Show validation questions (5-7 key points):
   - Market size estimation
   - Founder skills alignment (1-10)
   - Competition intensity (1-10)
   - Time to MVP (weeks)
   - Funding requirements (ballpark)
3. Calculate composite score (0-100)
4. Store validation result with idea
5. Display summary card

**Scoring Logic**:
- Demand (market size + founder fit): 40%
- Risk (competition + time/resources): 40%
- Feasibility (skills + scope): 20%

### `founder roadmap`
Generate a minimal MVP roadmap from a validated idea.

**Flow**:
1. Select a validated idea
2. Parse idea + validation results
3. Generate 3-phase roadmap:
   - Phase 1: Core MVP (user-facing value)
   - Phase 2: Polish & feedback loops
   - Phase 3: Launch & early metrics
4. Output as formatted table + export option
5. Save to `idea-{id}-ROADMAP.md`

**Roadmap Structure**:
```
# [Idea Title] - MVP Roadmap

## Validation Summary
- Score: 75/100
- Market Fit: High
- Risk Level: Medium

## Phase 1: Core (Weeks 1-4)
- [ ] Research & validation interviews (1w)
- [ ] Core feature prototyping (2w)
- [ ] Initial user testing (1w)

## Phase 2: Polish (Weeks 5-8)
- ...

## Phase 3: Launch (Weeks 9+)
- ...
```

## File Structure

```
cli/
├── src/
│   ├── index.ts                 # CLI entrypoint
│   ├── commands/
│   │   ├── new.ts              # `founder new` command
│   │   ├── validate.ts          # `founder validate` command
│   │   └── roadmap.ts           # `founder roadmap` command
│   ├── ui/
│   │   ├── components/
│   │   │   ├── IdeaForm.tsx     # Interactive form for `new`
│   │   │   ├── ValidationForm.tsx
│   │   │   ├── RoadmapView.tsx
│   │   │   └── Header.tsx       # Brand header
│   │   └── theme.ts            # Color/style constants
│   ├── lib/
│   │   ├── storage.ts          # ~/ .founder/ideas/ persistence
│   │   ├── scoring.ts          # Validation scoring logic
│   │   ├── roadmap-gen.ts       # Roadmap generation
│   │   └── cli-types.ts         # Types (Idea, Validation, etc.)
│   └── utils/
│       ├── logger.ts           # Styled console output
│       ├── errors.ts           # Error handling
│       └── paths.ts            # Path resolution
├── bin/
│   └── founder.ts              # Executable wrapper
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## Dependencies (Minimal)

**Core**:
- `ink` - Terminal UI framework
- `ink-text-input` - Text input component
- `ink-select-input` - Select list component
- `ink-spinner` - Loading indicator
- `react` - Ink dependency (peer)
- `commander` - CLI argument parsing (if needed, else use Ink alone)

**Type Support**:
- `@types/node` - Node.js types
- `typescript` - Compilation

**Development**:
- `tsx` - TypeScript runner (dev/test)

**NO dependencies**:
- No external API calls initially
- No authentication libraries
- No heavy crypto (use Node.js native)

## Data Persistence

**Storage Root**: `~/.founder/`

```
~/.founder/
├── ideas/
│   ├── {uuid}.json         # Raw idea + validation + roadmap
│   └── ...
└── config.json             # CLI preferences (editor, theme, etc.)
```

**Idea JSON Schema**:
```typescript
interface Idea {
  id: string;
  createdAt: string;
  title: string;
  problemStatement: string;
  targetUser: string;
  differentiator: string;
  validation?: {
    scoredAt: string;
    marketSize: number;
    founderFit: number;
    competitionIntensity: number;
    timeToMVP: number;
    fundingRequired: number;
    score: number;
  };
  roadmap?: {
    generatedAt: string;
    phases: RoadmapPhase[];
  };
}
```

## Development Workflow

```bash
# Install deps
pnpm install

# Run in watch mode
pnpm --filter @founderos/cli dev

# Build
pnpm --filter @founderos/cli build

# Run CLI
node dist/bin/founder.js new

# Link locally for global install
pnpm --filter @founderos/cli link --global
founder new
```

## Testing Strategy (Future)

- Unit: `jest` for scoring, roadmap logic
- Integration: Mock storage + Ink component testing
- E2E: Simulate user flows with stdin/stdout capture

## Future Enhancements

1. **Sync to Web**: `founder sync` uploads ideas to FounderOS dashboard
2. **GitHub Export**: `founder export-github` creates MASTER_PLAN.md
3. **Collaboration**: `founder share` generates sharable idea link
4. **Analytics**: `founder insights` shows opportunity pipeline stats
5. **Templates**: `founder use-template {name}` for idea scaffolding
6. **Config**: `founder config set-editor vim`
7. **History**: `founder list`, `founder show {id}`, `founder delete {id}`

## Success Criteria (MVP)

- ✅ CLI runs without Node version warnings
- ✅ All three commands (new, validate, roadmap) work offline
- ✅ Data persists in `~/.founder/`
- ✅ Ink UI is responsive and clean
- ✅ Error messages are helpful
- ✅ README provides clear usage examples
- ✅ No breaking changes to web app

## Next Steps (After Scaffolding)

1. Implement `founder new` interactive form
2. Implement `founder validate` scoring engine
3. Implement `founder roadmap` generator
4. Add unit tests for scoring + roadmap
5. Add CLI help text and examples
6. Build + package for local testing
7. Write integration tests
8. Consider `founder sync` to connect with web app
