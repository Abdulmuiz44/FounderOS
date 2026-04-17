/**
 * Roadmap Command Component
 * 
 * Generate and display MVP roadmap for a validated idea
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import * as fs from 'fs/promises';
import * as path from 'path';
import { homedir } from 'os';
import { listIdeas } from '../lib/storage.js';
import { generateRoadmap, roadmapToMarkdown } from '../lib/roadmap-gen.js';
import type { Idea } from '../lib/cli-types.js';

interface RoadmapState {
  step: 'selectIdea' | 'generating' | 'done';
  ideas?: Idea[];
  selectedIdea?: Idea;
  roadmapPath?: string;
  error?: string;
}

interface RoadmapCommandProps {
  onDone: () => void;
}

const RoadmapCommand: React.FC<RoadmapCommandProps> = ({ onDone }) => {
  const [state, setState] = useState<RoadmapState>({
    step: 'selectIdea',
  });

  // Load validated ideas on mount
  useEffect(() => {
    const load = async () => {
      try {
        const allIdeas = await listIdeas();
        const validatedIdeas = allIdeas.filter((idea) => idea.validation);

        setState((s) => ({
          ...s,
          ideas: validatedIdeas,
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          error: `Failed to load ideas: ${err instanceof Error ? err.message : 'Unknown error'}`,
          step: 'done',
        }));
      }
    };
    load();
  }, []);

  const handleGenerateRoadmap = async (idea: Idea) => {
    setState((s) => ({ ...s, step: 'generating' }));

    try {
      const roadmap = generateRoadmap(idea);
      const markdown = roadmapToMarkdown(idea, roadmap);

      // Save to file
      const filename = `${idea.id}-ROADMAP.md`;
      const filePath = path.join(homedir(), '.founder', filename);
      await fs.writeFile(filePath, markdown);

      setState((s) => ({
        ...s,
        selectedIdea: idea,
        roadmapPath: filePath,
        step: 'done',
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: `Failed to generate roadmap: ${err instanceof Error ? err.message : 'Unknown error'}`,
        step: 'done',
      }));
    }
  };

  if (state.step === 'selectIdea') {
    if (!state.ideas) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="yellow">⏳ Loading validated ideas...</Text>
        </Box>
      );
    }

    if (state.ideas.length === 0) {
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="yellow">
          <Text color="yellow">⚠ No validated ideas found</Text>
          <Text>Run <Text bold color="cyan">founder validate</Text> on an idea first</Text>
          <Box marginTop={1}>
            <Text dimColor>Press <Text bold color="cyan">Enter</Text> to return to menu</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={onDone} />
        </Box>
      );
    }

    const items = [
      ...state.ideas.map((idea) => ({
        label: `${idea.title} (Score: ${idea.validation?.score || '?'}/100)`,
        value: idea,
      })),
      { label: '← Back to menu', value: null as any }
    ];

    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          ✦ Generate MVP Roadmap
        </Text>
        <Text dimColor>Select an idea to roadmap:</Text>
        <Box marginTop={1}>
          <SelectInput
            items={items}
            onSelect={(item) => {
              if (item.value === null) {
                onDone();
              } else {
                handleGenerateRoadmap(item.value);
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  if (state.step === 'generating') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">⏳ Generating roadmap...</Text>
      </Box>
    );
  }

  // Done/Error state
  if (state.step === 'done') {
    if (state.error) {
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="red">
          <Text color="red">✗ Error</Text>
          <Text>{state.error}</Text>
          <Box marginTop={1}>
            <Text dimColor>Press <Text bold color="cyan">Enter</Text> to return to menu</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={onDone} />
        </Box>
      );
    }

    if (state.roadmapPath && state.selectedIdea) {
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="green">
          <Text bold color="green">✓ Roadmap generated!</Text>
          <Box marginTop={1}>
            <Text>Saved to: <Text bold>{state.roadmapPath}</Text></Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>You can view this file with:</Text>
            <Text bold color="cyan">cat {state.roadmapPath}</Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>Next steps:</Text>
            <Text> • Review the roadmap and adjust timelines</Text>
            <Text> • Create GitHub repo and issues from tasks</Text>
            <Text> • Share roadmap with team and investors</Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Press <Text bold color="cyan">Enter</Text> to return to menu</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={onDone} />
        </Box>
      );
    }
  }

  return null;
};

export default RoadmapCommand;
