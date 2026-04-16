/**
 * Main CLI App Component
 * 
 * Routes commands: new, validate, roadmap, help
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import NewCommand from './commands/new.js';
import ValidateCommand from './commands/validate.js';
import RoadmapCommand from './commands/roadmap.js';

type CommandType = 'new' | 'validate' | 'roadmap' | null;

interface AppProps {
  command?: CommandType;
}

const App: React.FC<AppProps> = ({ command = null }) => {
  const [selectedCommand, setSelectedCommand] = useState<CommandType>(command);

  const reset = () => setSelectedCommand(null);

  if (selectedCommand === 'new') {
    return <NewCommand onDone={reset} />;
  }

  if (selectedCommand === 'validate') {
    return <ValidateCommand onDone={reset} />;
  }

  if (selectedCommand === 'roadmap') {
    return <RoadmapCommand onDone={reset} />;
  }

  // Main menu
  const items = [
    { label: '✦ Capture a new idea', value: 'new' },
    { label: '✦ Score an idea', value: 'validate' },
    { label: '✦ Generate MVP roadmap', value: 'roadmap' },
    { label: 'Exit', value: 'exit' },
  ];

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          ✦ FounderOS CLI ✦
        </Text>
      </Box>
      <Text dimColor>Local-first startup idea validation and roadmapping</Text>
      
      <Box marginTop={1} marginBottom={1} flexDirection="column">
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === 'exit') {
              process.exit(0);
            } else {
              setSelectedCommand(item.value as CommandType);
            }
          }}
        />
      </Box>
      
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>Use arrow keys to navigate • Enter to select</Text>
      </Box>
    </Box>
  );
};

export default App;
