/**
 * Roadmap Command Component
 *
 * Generate and display an MVP roadmap for a validated idea.
 */

import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { listIdeas } from '../lib/storage.js';
import { generateAndPersistRoadmap } from '../lib/roadmap-gen.js';
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

  useEffect(() => {
    const load = async () => {
      try {
        const allIdeas = await listIdeas();
        setState((s) => ({
          ...s,
          ideas: allIdeas.filter((idea) => idea.validation),
        }));
      } catch (err) {
        setState((s) => ({
          ...s,
          error: `Failed to load ideas: ${err instanceof Error ? err.message : 'Unknown error'}`,
          step: 'done',
        }));
      }
    };
    void load();
  }, []);

  const handleGenerateRoadmap = async (idea: Idea) => {
    setState((s) => ({ ...s, step: 'generating' }));

    try {
      const roadmap = await generateAndPersistRoadmap(idea);
      setState((s) => ({
        ...s,
        selectedIdea: { ...idea, roadmap },
        roadmapPath: roadmap.markdownPath,
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
          <Text color="yellow">Loading validated ideas...</Text>
        </Box>
      );
    }

    if (state.ideas.length === 0) {
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="yellow">
          <Text color="yellow">No validated ideas found</Text>
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
        label: `${idea.title} (Score: ${idea.validation?.score ?? '?'}/100)`,
        value: idea,
      })),
      { label: 'Back to menu', value: null as unknown as Idea },
    ];

    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">Generate MVP Roadmap</Text>
        <Text dimColor>Select an idea to roadmap:</Text>
        <Box marginTop={1}>
          <SelectInput
            items={items}
            onSelect={(item) => {
              if (item.value === null) {
                onDone();
              } else {
                void handleGenerateRoadmap(item.value);
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
        <Text color="yellow">Generating roadmap...</Text>
      </Box>
    );
  }

  if (state.step === 'done') {
    if (state.error) {
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="red">
          <Text color="red">Error</Text>
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
          <Text bold color="green">Roadmap generated and saved</Text>
          <Box marginTop={1}>
            <Text>Markdown: <Text bold>{state.roadmapPath}</Text></Text>
          </Box>
          <Box marginTop={1}>
            <Text dimColor>Roadmap metadata was also written to the idea JSON.</Text>
          </Box>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>Next steps:</Text>
            <Text>- Review the roadmap and adjust timelines</Text>
            <Text>- Create implementation issues from the tasks</Text>
            <Text>- Run founder show {state.selectedIdea.id} to inspect the saved record</Text>
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
