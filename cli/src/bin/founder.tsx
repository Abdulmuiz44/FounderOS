#!/usr/bin/env node
/**
 * FounderOS CLI Executable Entry Point
 * 
 * This is the executable wrapper that Node invokes.
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import React from 'react';
import { render } from 'ink';
import App from '../App.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0] as any;

// For now, we just render the main app
const { unmount } = render(<App command={command} />);

process.on('SIGINT', () => {
  unmount();
  process.exit(0);
});
