import * as fs from 'fs/promises';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { parseArgs, readStringFlag, hasFlag } from './arg-parser.js';
import { CliError } from './errors.js';
import {
  createIdea,
  deleteIdea,
  findIdea,
  listIdeas,
  updateIdea,
  writeIdea,
  parseIdeasBundle,
  makeImportSafeIdea,
  createRenamedIdea,
} from './storage.js';
import { calculateValidationScore, type ScoringInput } from './scoring.js';
import { formatIdeaDetails, formatIdeaList } from './formatters.js';
import { generateAndPersistRoadmap } from './roadmap-gen.js';
import type { IdeasExportBundle } from './cli-types.js';

type RouteResult = {
  exitCode: number;
  keepAlive?: boolean;
};

const rootHelp = `FounderOS CLI

Usage:
  founder
  founder <command> [arguments]

Commands:
  new                 Capture a startup idea (interactive or flags)
  validate            Score a saved idea (interactive or flags)
  roadmap             Generate an MVP roadmap (interactive or by id)
  list                Show saved ideas
  show <idea-id>      Show full idea details
  delete <idea-id>    Delete an idea after confirmation
  export              Export ideas bundle to a JSON file
  import              Import ideas bundle from a JSON file
  help                Show this help

Global:
  --help              Show help for any command
  --json              Return machine-readable output for supported commands

Run "founder <command> --help" for command-specific help.`;

const commandHelp: Record<string, string> = {
  new: `Usage: founder new [--title <text> --problem <text> --target-user <text> --differentiator <text>] [--json]

Without flags, opens interactive capture flow.
With all required flags, creates the idea non-interactively.`,
  validate: `Usage: founder validate [<idea-id>] [--pain-intensity <1-10> --urgency <1-10> --target-user-clarity <1-10> --willingness-to-pay <1-10> --competition-saturation <1-10> --distribution-difficulty <1-10> --founder-advantage <1-10>] [--json]

Without id/score flags, opens interactive validation flow.
With id and all score flags, validates non-interactively.`,
  roadmap: `Usage: founder roadmap [<idea-id>] [--json]

Without id, opens interactive roadmap flow.
With id, generates roadmap directly for that idea.`,
  list: `Usage: founder list [--json]

Show all saved ideas with title, id, updated date, and validation score.`,
  show: `Usage: founder show <idea-id> [--json]

Render full local details for a saved idea.`,
  delete: `Usage: founder delete <idea-id> [--json]

Delete a local idea JSON file after confirmation.`,
  export: `Usage: founder export --path <file.json> [--json]

Export all saved ideas to a local JSON bundle.`,
  import: `Usage: founder import --path <file.json> [--mode skip|overwrite|rename] [--json]

Import ideas from a local JSON bundle with collision handling.`,
};

const print = (message: string): void => {
  output.write(`${message}\n`);
};

const printJson = (value: unknown): void => {
  print(JSON.stringify(value, null, 2));
};

const renderInteractive = async (
  command?: 'new' | 'validate' | 'roadmap',
): Promise<RouteResult> => {
  const [{ render }, React, { default: App }] = await Promise.all([
    import('ink'),
    import('react'),
    import('../App.js'),
  ]);

  const { unmount } = render(React.createElement(App, { command: command ?? null }));

  process.on('SIGINT', () => {
    unmount();
    process.exit(0);
  });

  return { exitCode: 0, keepAlive: true };
};

const confirmDelete = async (ideaTitle: string): Promise<boolean> => {
  const rl = createInterface({ input, output });
  try {
    const answer = await rl.question(
      `Delete "${ideaTitle}"? This cannot be undone. Type "yes" to confirm: `,
    );
    return answer.trim().toLowerCase() === 'yes';
  } finally {
    rl.close();
  }
};

const requirePositional = (positionals: string[], index: number, label: string): string => {
  const value = positionals[index];
  if (!value) {
    throw new CliError('MISSING_ARGUMENT', `Missing required ${label}.`);
  }
  return value;
};

const parseScore = (name: string, raw: string | undefined): number => {
  if (raw === undefined) {
    throw new CliError('MISSING_ARGUMENT', `Missing required --${name}.`);
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new CliError('INVALID_ARGUMENT', `--${name} must be an integer between 1 and 10.`);
  }
  return value;
};

const parseScoringInput = (flags: Record<string, string | boolean>): ScoringInput => {
  return {
    painIntensity: parseScore('pain-intensity', readStringFlag(flags, 'pain-intensity')),
    urgency: parseScore('urgency', readStringFlag(flags, 'urgency')),
    targetUserClarity: parseScore('target-user-clarity', readStringFlag(flags, 'target-user-clarity')),
    willingnessToPay: parseScore('willingness-to-pay', readStringFlag(flags, 'willingness-to-pay')),
    competitionSaturation: parseScore(
      'competition-saturation',
      readStringFlag(flags, 'competition-saturation'),
    ),
    distributionDifficulty: parseScore(
      'distribution-difficulty',
      readStringFlag(flags, 'distribution-difficulty'),
    ),
    founderAdvantage: parseScore('founder-advantage', readStringFlag(flags, 'founder-advantage')),
  };
};

const anyValidationFlagPresent = (flags: Record<string, string | boolean>): boolean => {
  const keys = [
    'pain-intensity',
    'urgency',
    'target-user-clarity',
    'willingness-to-pay',
    'competition-saturation',
    'distribution-difficulty',
    'founder-advantage',
  ];
  return keys.some((key) => hasFlag(flags, key));
};

const handleNewCommand = async (
  positionals: string[],
  flags: Record<string, string | boolean>,
): Promise<RouteResult> => {
  if (positionals.length > 0) {
    throw new CliError('INVALID_ARGUMENT', 'founder new does not accept positional arguments.');
  }

  const title = readStringFlag(flags, 'title');
  const problem = readStringFlag(flags, 'problem');
  const targetUser = readStringFlag(flags, 'target-user');
  const differentiator = readStringFlag(flags, 'differentiator');

  const anyFlag =
    title !== undefined ||
    problem !== undefined ||
    targetUser !== undefined ||
    differentiator !== undefined;

  if (!anyFlag) {
    return renderInteractive('new');
  }

  const missing: string[] = [];
  if (!title) missing.push('--title');
  if (!problem) missing.push('--problem');
  if (!targetUser) missing.push('--target-user');
  if (!differentiator) missing.push('--differentiator');
  if (missing.length > 0) {
    throw new CliError('MISSING_ARGUMENT', `Missing required flags: ${missing.join(', ')}`);
  }

  const idea = await createIdea(title!, problem!, targetUser!, differentiator!);
  if (hasFlag(flags, 'json')) {
    printJson(idea);
  } else {
    print(`Created idea ${idea.id}.`);
    print('Next: founder validate');
  }

  return { exitCode: 0 };
};

const handleValidateCommand = async (
  positionals: string[],
  flags: Record<string, string | boolean>,
): Promise<RouteResult> => {
  const hasScores = anyValidationFlagPresent(flags);
  if (positionals.length === 0 && !hasScores) {
    return renderInteractive('validate');
  }

  const id = requirePositional(positionals, 0, '<idea-id>');
  const idea = await findIdea(id);
  if (!idea) {
    throw new CliError('NOT_FOUND', `No idea found for id "${id}".`);
  }

  const scores = parseScoringInput(flags);
  const validation = calculateValidationScore(scores);
  const updated = await updateIdea({ ...idea, validation });

  if (hasFlag(flags, 'json')) {
    printJson({
      id: updated.id,
      score: validation.score,
      validation,
      updatedAt: updated.updatedAt,
    });
  } else {
    print(`Validated ${updated.id}: ${validation.score}/100`);
    print(`Recommendation: ${validation.recommendation}`);
  }

  return { exitCode: 0 };
};

const handleRoadmapCommand = async (
  positionals: string[],
  flags: Record<string, string | boolean>,
): Promise<RouteResult> => {
  if (positionals.length === 0) {
    return renderInteractive('roadmap');
  }

  const id = requirePositional(positionals, 0, '<idea-id>');
  const idea = await findIdea(id);
  if (!idea) {
    throw new CliError('NOT_FOUND', `No idea found for id "${id}".`);
  }

  if (!idea.validation) {
    throw new CliError('INVALID_ARGUMENT', `Idea "${id}" must be validated before roadmap generation.`);
  }

  const roadmap = await generateAndPersistRoadmap(idea);
  if (hasFlag(flags, 'json')) {
    printJson({ id, roadmap });
  } else {
    print(`Roadmap generated for ${id}.`);
    print(`Markdown: ${roadmap.markdownPath}`);
  }

  return { exitCode: 0 };
};

const handleExportCommand = async (flags: Record<string, string | boolean>): Promise<RouteResult> => {
  const exportPath = readStringFlag(flags, 'path');
  if (!exportPath) {
    throw new CliError('MISSING_ARGUMENT', 'Missing required --path for export.');
  }

  const ideas = await listIdeas();
  const bundle: IdeasExportBundle = {
    bundleVersion: 1,
    exportedAt: new Date().toISOString(),
    ideas,
  };

  await fs.writeFile(exportPath, JSON.stringify(bundle, null, 2));

  if (hasFlag(flags, 'json')) {
    printJson({ path: exportPath, count: ideas.length });
  } else {
    print(`Exported ${ideas.length} ideas to ${exportPath}`);
  }

  return { exitCode: 0 };
};

const handleImportCommand = async (flags: Record<string, string | boolean>): Promise<RouteResult> => {
  const importPath = readStringFlag(flags, 'path');
  if (!importPath) {
    throw new CliError('MISSING_ARGUMENT', 'Missing required --path for import.');
  }

  const modeRaw = readStringFlag(flags, 'mode') ?? 'skip';
  if (!['skip', 'overwrite', 'rename'].includes(modeRaw)) {
    throw new CliError('INVALID_ARGUMENT', '--mode must be one of: skip, overwrite, rename.');
  }

  const rawText = await fs.readFile(importPath, 'utf-8');
  const bundle = parseIdeasBundle(JSON.parse(rawText) as unknown);

  let imported = 0;
  let skipped = 0;
  let overwritten = 0;
  let renamed = 0;

  for (const importedIdea of bundle.ideas) {
    const existing = await findIdea(importedIdea.id);

    if (!existing) {
      await writeIdea(makeImportSafeIdea(importedIdea), { touchUpdatedAt: false });
      imported += 1;
      continue;
    }

    if (modeRaw === 'skip') {
      skipped += 1;
      continue;
    }

    if (modeRaw === 'overwrite') {
      await writeIdea(makeImportSafeIdea(importedIdea), { touchUpdatedAt: false });
      overwritten += 1;
      continue;
    }

    const renamedIdea = createRenamedIdea(importedIdea);
    await writeIdea(renamedIdea, { touchUpdatedAt: false });
    imported += 1;
    renamed += 1;
  }

  const summary = {
    source: importPath,
    bundleCount: bundle.ideas.length,
    imported,
    overwritten,
    skipped,
    renamed,
    mode: modeRaw,
  };

  if (hasFlag(flags, 'json')) {
    printJson(summary);
  } else {
    print(
      `Imported: ${summary.imported}, overwritten: ${summary.overwritten}, skipped: ${summary.skipped}, renamed: ${summary.renamed}`,
    );
  }

  return { exitCode: 0 };
};

const handleShowCommand = async (
  positionals: string[],
  flags: Record<string, string | boolean>,
): Promise<RouteResult> => {
  const id = requirePositional(positionals, 0, '<idea-id>');
  const idea = await findIdea(id);
  if (!idea) {
    throw new CliError('NOT_FOUND', `No idea found for id "${id}".`);
  }

  if (hasFlag(flags, 'json')) {
    printJson(idea);
  } else {
    print(formatIdeaDetails(idea));
  }

  return { exitCode: 0 };
};

const handleDeleteCommand = async (
  positionals: string[],
  flags: Record<string, string | boolean>,
): Promise<RouteResult> => {
  const id = requirePositional(positionals, 0, '<idea-id>');
  const idea = await findIdea(id);
  if (!idea) {
    throw new CliError('NOT_FOUND', `No idea found for id "${id}".`);
  }

  const confirmed = hasFlag(flags, 'yes') || (await confirmDelete(idea.title));
  if (!confirmed) {
    if (hasFlag(flags, 'json')) {
      printJson({ deleted: false, id, reason: 'cancelled' });
    } else {
      print('Delete cancelled.');
    }
    return { exitCode: 0 };
  }

  const deleted = await deleteIdea(id);
  if (!deleted) {
    throw new CliError('NOT_FOUND', `No idea found for id "${id}".`);
  }

  if (hasFlag(flags, 'json')) {
    printJson({ deleted: true, id });
  } else {
    print(`Deleted ${id}.`);
  }

  return { exitCode: 0 };
};

const handleListCommand = async (flags: Record<string, string | boolean>): Promise<RouteResult> => {
  const ideas = await listIdeas();

  if (hasFlag(flags, 'json')) {
    printJson(ideas);
  } else {
    print(formatIdeaList(ideas));
  }

  return { exitCode: 0 };
};

const printError = (err: unknown): RouteResult => {
  if (err instanceof CliError) {
    print(`Error: ${err.message}`);
    return { exitCode: err.exitCode };
  }

  print(`Error: ${err instanceof Error ? err.message : String(err)}`);
  return { exitCode: 1 };
};

export const routeCommand = async (argv: string[]): Promise<RouteResult> => {
  const [command, ...args] = argv;

  if (!command) {
    return renderInteractive();
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    print(rootHelp);
    return { exitCode: 0 };
  }

  const { flags, positionals } = parseArgs(args);

  if (hasFlag(flags, 'help')) {
    const help = commandHelp[command];
    if (help) {
      print(help);
      return { exitCode: 0 };
    }
  }

  try {
    if (command === 'new') {
      return await handleNewCommand(positionals, flags);
    }

    if (command === 'validate') {
      return await handleValidateCommand(positionals, flags);
    }

    if (command === 'roadmap') {
      return await handleRoadmapCommand(positionals, flags);
    }

    if (command === 'list') {
      return await handleListCommand(flags);
    }

    if (command === 'show') {
      return await handleShowCommand(positionals, flags);
    }

    if (command === 'delete') {
      return await handleDeleteCommand(positionals, flags);
    }

    if (command === 'export') {
      return await handleExportCommand(flags);
    }

    if (command === 'import') {
      return await handleImportCommand(flags);
    }

    print(`Unknown command "${command}".\n\n${rootHelp}`);
    return { exitCode: 2 };
  } catch (err) {
    return printError(err);
  }
};
