export interface ParsedArgs {
  flags: Record<string, string | boolean>;
  positionals: string[];
}

export const parseArgs = (args: string[]): ParsedArgs => {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];

    if (!token.startsWith('-') || token === '-') {
      positionals.push(token);
      continue;
    }

    if (token === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }

    if (token.startsWith('--')) {
      const content = token.slice(2);
      const eqIndex = content.indexOf('=');
      if (eqIndex > -1) {
        const key = content.slice(0, eqIndex);
        const value = content.slice(eqIndex + 1);
        flags[key] = value;
        continue;
      }

      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        flags[content] = next;
        i += 1;
      } else {
        flags[content] = true;
      }
      continue;
    }

    const short = token.slice(1);
    if (short === 'h') {
      flags.help = true;
      continue;
    }

    if (short.length > 1) {
      for (const key of short) {
        flags[key] = true;
      }
      continue;
    }

    const next = args[i + 1];
    if (next && !next.startsWith('-')) {
      flags[short] = next;
      i += 1;
    } else {
      flags[short] = true;
    }
  }

  return { flags, positionals };
};

export const readStringFlag = (
  flags: Record<string, string | boolean>,
  name: string,
): string | undefined => {
  const value = flags[name];
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
};

export const hasFlag = (
  flags: Record<string, string | boolean>,
  name: string,
): boolean => {
  return flags[name] === true || typeof flags[name] === 'string';
};
