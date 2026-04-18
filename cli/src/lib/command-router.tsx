import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { deleteIdea, findIdea, listIdeas } from './storage.js';
import { formatIdeaDetails, formatIdeaList } from './formatters.js';

type RouteResult = {
  exitCode: number;
  keepAlive?: boolean;
};

const rootHelp = `FounderOS CLI

Usage:
  founder
  founder <command> [arguments]

Commands:
  new                 Capture a startup idea interactively
  validate            Score a saved idea interactively
  roadmap             Generate an MVP roadmap for a validated idea
  list                Show saved ideas
  show <idea-id>      Show full idea details
  delete <idea-id>    Delete an idea after confirmation
  help                Show this help

Run "founder <command> --help" for command-specific help.`;

const commandHelp: Record<string, string> = {
  new: `Usage: founder new

Capture a startup idea interactively and save it to ~/.founder/ideas/.

Prompts for title, problem, target user, and differentiator.`,
  validate: `Usage: founder validate

Select a saved idea and score it across validation dimensions.

Writes validation and updatedAt back into the idea JSON.`,
  roadmap: `Usage: founder roadmap

Select a validated idea and generate an MVP roadmap.

Exports markdown to ~/.founder/<idea-id>-ROADMAP.md and persists roadmap metadata into the idea JSON.`,
  list: `Usage: founder list

Show all saved ideas with title, id, updated date, and validation score.`,
  show: `Usage: founder show <idea-id>

Render full local details for a saved idea, including validation and roadmap summaries when present.`,
  delete: `Usage: founder delete <idea-id>

Delete a local idea JSON file after confirmation. This does not delete exported roadmap markdown.`,
};

const interactiveCommands = new Set(['new', 'validate', 'roadmap']);

const print = (message: string): void => {
  output.write(`${message}\n`);
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

export const routeCommand = async (argv: string[]): Promise<RouteResult> => {
  const [command, ...args] = argv;

  if (!command) {
    return renderInteractive();
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    print(rootHelp);
    return { exitCode: 0 };
  }

  if (args.includes('--help') || args.includes('-h')) {
    const help = commandHelp[command];
    if (help) {
      print(help);
      return { exitCode: 0 };
    }
  }

  if (interactiveCommands.has(command)) {
    return renderInteractive(command as 'new' | 'validate' | 'roadmap');
  }

  if (command === 'list') {
    const ideas = await listIdeas();
    print(formatIdeaList(ideas));
    return { exitCode: 0 };
  }

  if (command === 'show') {
    const id = args[0];
    if (!id) {
      print(`${commandHelp.show}\n\nMissing required <idea-id>.`);
      return { exitCode: 1 };
    }

    const idea = await findIdea(id);
    if (!idea) {
      print(`No idea found for id "${id}".\nRun "founder list" to see saved ideas.`);
      return { exitCode: 1 };
    }

    print(formatIdeaDetails(idea));
    return { exitCode: 0 };
  }

  if (command === 'delete') {
    const id = args[0];
    if (!id) {
      print(`${commandHelp.delete}\n\nMissing required <idea-id>.`);
      return { exitCode: 1 };
    }

    const idea = await findIdea(id);
    if (!idea) {
      print(`No idea found for id "${id}".\nRun "founder list" to see saved ideas.`);
      return { exitCode: 1 };
    }

    if (!(await confirmDelete(idea.title))) {
      print('Delete cancelled.');
      return { exitCode: 0 };
    }

    const deleted = await deleteIdea(id);
    if (!deleted) {
      print(`No idea found for id "${id}".`);
      return { exitCode: 1 };
    }

    print(`Deleted ${id}.`);
    return { exitCode: 0 };
  }

  print(`Unknown command "${command}".\n\n${rootHelp}`);
  return { exitCode: 1 };
};
