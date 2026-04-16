/**
 * FounderOS CLI Entry Point
 * 
 * This is the main entry point for the interactive CLI experience.
 */

import React from 'react';
import { render } from 'ink';
import App from './App.js';

const main = async () => {
  const { unmount } = render(<App />);
};

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
