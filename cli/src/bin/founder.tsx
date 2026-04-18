#!/usr/bin/env node
/**
 * FounderOS CLI executable entry point.
 */

import { routeCommand } from '../lib/command-router.js';

routeCommand(process.argv.slice(2))
  .then(({ exitCode, keepAlive }) => {
    if (keepAlive) {
      process.exitCode = exitCode;
      return;
    }
    process.exit(exitCode);
  })
  .catch((err) => {
    console.error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });