#!/usr/bin/env node
/**
 * FounderOS CLI Executable Entry Point
 *
 * This is the executable wrapper that Node invokes.
 */
import { fileURLToPath } from 'url';
import path from 'path';
import { render } from 'ink';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Parse command-line arguments
const args = process.argv.slice(2);
const command = args[0];
// For now, we just render the main app
// Future: parse command and pass it as prop
const { unmount } = render(command, { undefined } /  > );
process.on('SIGINT', () => {
    unmount();
    process.exit(0);
});
//# sourceMappingURL=founder.js.map