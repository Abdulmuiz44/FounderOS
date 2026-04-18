/**
 * Validate Command Component
 * 
 * Interactive form to validate and score an idea
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { listIdeas, updateIdea } from '../lib/storage.js';
import {
  calculateValidationScore,
  scoreExplanation,
  type ScoringInput,
} from '../lib/scoring.js';
import type { Idea, ValidationResult } from '../lib/cli-types.js';

interface ValidateState {
  step:
    | 'selectIdea'
    | 'painIntensity'
    | 'urgency'
    | 'targetUserClarity'
    | 'willingnessToPay'
    | 'competitionSaturation'
    | 'distributionDifficulty'
    | 'founderAdvantage'
    | 'calculating'
    | 'done';
  ideas?: Idea[];
  selectedIdea?: Idea;
  form: ScoringInput;
  result?: ValidationResult;
  error?: string;
  inputValue: string;
}

interface ValidateCommandProps {
  onDone: () => void;
}

const ValidateCommand: React.FC<ValidateCommandProps> = ({ onDone }) => {
  const [state, setState] = useState<ValidateState>({
    step: 'selectIdea',
    form: {
      painIntensity: 5,
      urgency: 5,
      targetUserClarity: 5,
      willingnessToPay: 5,
      competitionSaturation: 5,
      distributionDifficulty: 5,
      founderAdvantage: 5,
    },
    inputValue: '',
  });

  // Load ideas on mount
  useEffect(() => {
    const load = async () => {
      try {
        const ideas = await listIdeas();
        setState((s) => ({ ...s, ideas }));
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

  const handleScoreSubmit = (field: keyof ScoringInput, nextStep: ValidateState['step']) => {
    const num = parseInt(state.inputValue, 10);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      setState((s) => ({
        ...s,
        form: { ...s.form, [field]: num },
        step: nextStep,
        inputValue: '',
      }));
    }
  };

  const finalizeValidation = async () => {
    const num = parseInt(state.inputValue, 10);
    if (isNaN(num) || num < 1 || num > 10) return;

    const finalForm = { ...state.form, founderAdvantage: num };
    setState((s) => ({ ...s, step: 'calculating' }));

    try {
      const result = calculateValidationScore(finalForm);
      const updatedIdea = await updateIdea({
        ...state.selectedIdea!,
        validation: result,
      });
      setState((s) => ({
        ...s,
        result,
        selectedIdea: updatedIdea,
        step: 'done',
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: `Failed to calculate: ${err instanceof Error ? err.message : 'Unknown error'}`,
        step: 'done',
      }));
    }
  };

  if (state.step === 'selectIdea') {
    if (!state.ideas) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="yellow">â³ Loading ideas...</Text>
        </Box>
      );
    }

    if (state.ideas.length === 0) {
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="yellow">
          <Text color="yellow">âš  No ideas found</Text>
          <Text>Run <Text bold color="cyan">founder new</Text> to create one first</Text>
          <Box marginTop={1}>
            <Text dimColor>Press <Text bold color="cyan">Enter</Text> to return to menu</Text>
          </Box>
          <TextInput value="" onChange={() => {}} onSubmit={onDone} />
        </Box>
      );
    }

    const items = [
      ...state.ideas.map((idea) => ({
        label: `${idea.title} (${idea.createdAt.split('T')[0]})`,
        value: idea,
      })),
      { label: 'â† Back to menu', value: null as any }
    ];

    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="cyan">
          âœ¦ Validate an Idea
        </Text>
        <Text dimColor>Select which idea to validate:</Text>
        <Box marginTop={1}>
          <SelectInput
            items={items}
            onSelect={(item) => {
              if (item.value === null) {
                onDone();
              } else {
                setState((s) => ({
                  ...s,
                  selectedIdea: item.value,
                  step: 'painIntensity',
                }));
              }
            }}
          />
        </Box>
      </Box>
    );
  }

  const renderScoreInput = (
    title: string,
    description: string,
    field: keyof ScoringInput,
    nextStep: ValidateState['step'],
    isLast = false
  ) => (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        âœ¦ Validating: {state.selectedIdea?.title}
      </Text>
      <Box marginTop={1}>
        <Text bold>{title}</Text>
      </Box>
      <Text dimColor>{description}</Text>
      <Box marginTop={1} marginBottom={1}>
        <Box marginRight={1}>
          <Text>Score (1-10):</Text>
        </Box>
        <TextInput
          value={state.inputValue}
          onChange={(val) => setState((s) => ({ ...s, inputValue: val }))}
          onSubmit={() => isLast ? finalizeValidation() : handleScoreSubmit(field, nextStep)}
          placeholder="5"
        />
      </Box>
      <Text dimColor italic>1 = Low/Bad, 10 = High/Good (for most metrics)</Text>
    </Box>
  );

  if (state.step === 'painIntensity') {
    return renderScoreInput(
      'Pain Intensity',
      'How painful is the problem for the user?',
      'painIntensity',
      'urgency'
    );
  }

  if (state.step === 'urgency') {
    return renderScoreInput(
      'Urgency',
      'Does the user need a solution NOW?',
      'urgency',
      'targetUserClarity'
    );
  }

  if (state.step === 'targetUserClarity') {
    return renderScoreInput(
      'Target User Clarity',
      'How clearly can you define and find your user?',
      'targetUserClarity',
      'willingnessToPay'
    );
  }

  if (state.step === 'willingnessToPay') {
    return renderScoreInput(
      'Willingness to Pay',
      'Is the user ready to pay for a solution?',
      'willingnessToPay',
      'competitionSaturation'
    );
  }

  if (state.step === 'competitionSaturation') {
    return renderScoreInput(
      'Competition Saturation',
      'How many alternatives exist? (1=None, 10=Too many)',
      'competitionSaturation',
      'distributionDifficulty'
    );
  }

  if (state.step === 'distributionDifficulty') {
    return renderScoreInput(
      'Distribution Difficulty',
      'How hard/expensive is it to reach users? (1=Easy, 10=Very Hard)',
      'distributionDifficulty',
      'founderAdvantage'
    );
  }

  if (state.step === 'founderAdvantage') {
    return renderScoreInput(
      'Founder Advantage',
      'Do you have unique skills or insights here?',
      'founderAdvantage',
      'calculating',
      true
    );
  }

  if (state.step === 'calculating') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">â³ Calculating score...</Text>
      </Box>
    );
  }

  // Done/Error state
  if (state.step === 'done') {
    if (state.error) {
        return (
          <Box flexDirection="column" padding={1} borderStyle="round" borderColor="red">
            <Text color="red">âœ— Error</Text>
            <Text>{state.error}</Text>
            <Box marginTop={1}>
              <Text dimColor>Press <Text bold color="cyan">Enter</Text> to return to menu</Text>
            </Box>
            <TextInput value="" onChange={() => {}} onSubmit={onDone} />
          </Box>
        );
      }

    if (state.result) {
      return (
        <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
          <Text bold color="cyan">
            âœ¦ Validation Summary: {state.selectedIdea?.title}
          </Text>
          
          <Box marginTop={1} paddingX={1} borderStyle="double" borderColor="white">
            <Text bold>Total Score: </Text>
            <Text color={state.result.score >= 70 ? "green" : state.result.score >= 40 ? "yellow" : "red"}>
              {state.result.score}/100
            </Text>
            <Text dimColor> - {scoreExplanation(state.result.score)}</Text>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text bold color="green">Strengths:</Text>
            {state.result.strengths.map((s, i) => (
              <Text key={i}> â€¢ {s}</Text>
            ))}
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text bold color="red">Risks:</Text>
            {state.result.risks.map((r, i) => (
              <Text key={i}> â€¢ {r}</Text>
            ))}
          </Box>

          <Box marginTop={1} padding={1} borderStyle="round" borderColor="white">
            <Text bold color="white">Recommendation:</Text>
            <Text color="white"> {state.result.recommendation}</Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Data saved to ~/.founder/ideas/{state.selectedIdea?.id}.json</Text>
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

export default ValidateCommand;

