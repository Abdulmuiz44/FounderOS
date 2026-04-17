/**
 * New Command Component
 * 
 * Interactive form to capture a new startup idea
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { createIdea } from '../lib/storage.js';
import type { Idea } from '../lib/cli-types.js';

interface FormState {
  step: 'title' | 'problem' | 'targetUser' | 'differentiator' | 'saving' | 'done';
  title: string;
  problem: string;
  targetUser: string;
  differentiator: string;
  idea?: Idea;
  error?: string;
}

interface NewCommandProps {
  onDone: () => void;
}

const NewCommand: React.FC<NewCommandProps> = ({ onDone }) => {
  const [state, setState] = useState<FormState>({
    step: 'title',
    title: '',
    problem: '',
    targetUser: '',
    differentiator: '',
  });

  const handleTitleSubmit = (value: string) => {
    if (value.trim()) {
      setState((s) => ({ ...s, title: value, step: 'problem' }));
    }
  };

  const handleProblemSubmit = (value: string) => {
    if (value.trim()) {
      setState((s) => ({ ...s, problem: value, step: 'targetUser' }));
    }
  };

  const handleTargetUserSubmit = (value: string) => {
    if (value.trim()) {
      setState((s) => ({ ...s, targetUser: value, step: 'differentiator' }));
    }
  };

  const handleDifferentiatorSubmit = async (value: string) => {
    if (value.trim()) {
      setState((s) => ({ ...s, differentiator: value, step: 'saving' }));

      try {
        const idea = await createIdea(
          state.title,
          state.problem,
          state.targetUser,
          value,
        );
        setState((s) => ({ ...s, idea, step: 'done' }));
      } catch (err) {
        setState((s) => ({
          ...s,
          error: `Failed to save idea: ${err instanceof Error ? err.message : 'Unknown error'}`,
          step: 'done',
        }));
      }
    }
  };

  if (state.step === 'title') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          ✦ Capture Your Startup Idea
        </Text>
        <Box marginTop={1} marginBottom={1}>
          <Box marginRight={1}>
            <Text>Idea title:</Text>
          </Box>
          <TextInput
            value={state.title}
            onChange={(val) => setState((s) => ({ ...s, title: val }))}
            onSubmit={handleTitleSubmit}
            placeholder="e.g., AI-powered resume builder"
          />
        </Box>
      </Box>
    );
  }

  if (state.step === 'problem') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          ✦ Capture Your Startup Idea
        </Text>
        <Text dimColor>Title: {state.title}</Text>
        <Box marginTop={1} marginBottom={1}>
          <Box marginRight={1}>
            <Text>Problem statement:</Text>
          </Box>
          <TextInput
            value={state.problem}
            onChange={(val) => setState((s) => ({ ...s, problem: val }))}
            onSubmit={handleProblemSubmit}
            placeholder="What problem does this solve?"
          />
        </Box>
      </Box>
    );
  }

  if (state.step === 'targetUser') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          ✦ Capture Your Startup Idea
        </Text>
        <Text dimColor>Title: {state.title}</Text>
        <Box marginTop={1} marginBottom={1}>
          <Box marginRight={1}>
            <Text>Target user:</Text>
          </Box>
          <TextInput
            value={state.targetUser}
            onChange={(val) => setState((s) => ({ ...s, targetUser: val }))}
            onSubmit={handleTargetUserSubmit}
            placeholder="Who is your primary user?"
          />
        </Box>
      </Box>
    );
  }

  if (state.step === 'differentiator') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          ✦ Capture Your Startup Idea
        </Text>
        <Text dimColor>Title: {state.title}</Text>
        <Box marginTop={1} marginBottom={1}>
          <Box marginRight={1}>
            <Text>Key differentiator:</Text>
          </Box>
          <TextInput
            value={state.differentiator}
            onChange={(val) => setState((s) => ({ ...s, differentiator: val }))}
            onSubmit={handleDifferentiatorSubmit}
            placeholder="What makes you different?"
          />
        </Box>
      </Box>
    );
  }

  if (state.step === 'saving') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">⏳ Saving idea...</Text>
      </Box>
    );
  }

  // Done/Error state
  if (state.step === 'done') {
    return (
      <Box flexDirection="column" padding={1} borderStyle="round" borderColor={state.error ? "red" : "green"}>
        <Text color={state.error ? "red" : "green"}>
          {state.error ? `✗ ${state.error}` : "✓ Idea saved!"}
        </Text>
        {state.idea && (
          <Box marginTop={1} flexDirection="column">
            <Text>ID: <Text bold>{state.idea.id}</Text></Text>
            <Box marginTop={1}>
              <Text>Next: Run <Text bold color="cyan">founder validate</Text> to score your idea</Text>
            </Box>
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>Press </Text>
          <Text bold color="cyan">Enter</Text>
          <Text dimColor> to return to menu</Text>
        </Box>
        <TextInput value="" onChange={() => {}} onSubmit={onDone} />
      </Box>
    );
  }

  return null;
};

export default NewCommand;
