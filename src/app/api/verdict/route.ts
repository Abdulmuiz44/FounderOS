import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function countSignals(value: unknown) {
  if (!value) return 0;

  if (Array.isArray(value)) {
    return value.filter(Boolean).length;
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,;]/)
      .map((item) => item.trim())
      .filter(Boolean).length;
  }

  return 0;
}

function hasAny(text: string, patterns: string[]) {
  return patterns.some((pattern) => text.includes(pattern));
}

function buildExplanation(
  verdictType: 'continue' | 'pivot' | 'simplify',
  building: unknown,
  audience: unknown,
  blockers: unknown,
  uncertainties: unknown,
) {
  const buildingText = typeof building === 'string' && building.trim() ? building.trim() : 'this project';
  const audienceText = typeof audience === 'string' && audience.trim() ? audience.trim() : 'the target audience';
  const blockerText = Array.isArray(blockers)
    ? blockers.filter(Boolean).join(', ')
    : typeof blockers === 'string' && blockers.trim()
      ? blockers.trim()
      : '';
  const uncertaintyText = Array.isArray(uncertainties)
    ? uncertainties.filter(Boolean).join(', ')
    : typeof uncertainties === 'string' && uncertainties.trim()
      ? uncertainties.trim()
      : '';

  if (verdictType === 'pivot') {
    return `The current direction for ${buildingText} shows enough friction that a new angle is likely needed. The strongest warning signs are ${blockerText || 'repeated blockers'} for ${audienceText}.`;
  }

  if (verdictType === 'simplify') {
    return `There is signal in ${buildingText}, but the scope is still carrying too much uncertainty. Tightening the wedge and removing unknowns around ${uncertaintyText || 'distribution and positioning'} should increase your odds.`;
  }

  return `The work on ${buildingText} is showing healthy momentum for ${audienceText}. Keep the current direction, but continue validating the highest-risk assumptions and watch the blockers: ${blockerText || uncertaintyText || 'none reported yet'}.`;
}

function buildFocus(verdictType: 'continue' | 'pivot' | 'simplify') {
  if (verdictType === 'pivot') {
    return 'Reframe the problem around the clearest pain point and test a smaller, sharper offer with a fresh audience segment.';
  }

  if (verdictType === 'simplify') {
    return 'Cut scope to one core job-to-be-done and remove any feature that does not directly help users reach value faster.';
  }

  return 'Double down on the current workflow, tighten onboarding, and collect more evidence from live users before expanding scope.';
}

function buildExperiment(verdictType: 'continue' | 'pivot' | 'simplify', audience: unknown) {
  const audienceText = typeof audience === 'string' && audience.trim() ? audience.trim() : 'your target users';

  if (verdictType === 'pivot') {
    return `Run five problem interviews with ${audienceText} focused only on the pain point they already pay to solve.`;
  }

  if (verdictType === 'simplify') {
    return `Test a stripped-down version of the product with ${audienceText} and measure whether activation improves when the workflow is reduced to one primary action.`;
  }

  return `Offer a concierge onboarding to the next five ${audienceText} and track whether the activation rate improves when you remove manual friction.`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { building, audience, summary, blockers, uncertainties } = body;

  const inputText = [building, audience, summary, blockers, uncertainties]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const blockerCount = countSignals(blockers);
  const uncertaintyCount = countSignals(uncertainties);
  const summaryLength = typeof summary === 'string' ? summary.trim().length : 0;

  let verdictType: 'continue' | 'pivot' | 'simplify' = 'continue';
  if (blockerCount >= 3 || hasAny(inputText, ['no demand', 'not working', 'cannot', "can't", 'dead end'])) {
    verdictType = 'pivot';
  } else if (uncertaintyCount >= 2 || summaryLength < 120) {
    verdictType = 'simplify';
  }

  const tagOptions = [] as string[];
  if (verdictType === 'continue') tagOptions.push('Momentum');
  if (verdictType === 'simplify') tagOptions.push('Clarity');
  if (verdictType === 'pivot') tagOptions.push('Attention');

  if (hasAny(inputText, ['pricing', 'money', 'revenue', 'monetize'])) tagOptions.push('Monetization');
  if (hasAny(inputText, ['users', 'customers', 'interview', 'feedback'])) tagOptions.push('Customer Signal');
  if (hasAny(inputText, ['competition', 'competitor', 'differentiation'])) tagOptions.push('Competition');

  const responsePayload = {
    verdict_type: verdictType,
    explanation: buildExplanation(verdictType, building, audience, blockers, uncertainties),
    focus_for_next_week: buildFocus(verdictType),
    experiment_suggestion: buildExperiment(verdictType, audience),
    tags: Array.from(new Set(tagOptions)).slice(0, 3),
  };

  const { data, error } = await supabase
    .from('verdicts')
    .insert({
      user_id: user.id,
      week_start_date: new Date().toISOString(),
      input_context: body,
      verdict_type: responsePayload.verdict_type,
      explanation: responsePayload.explanation,
      focus_for_next_week: responsePayload.focus_for_next_week,
      experiment_suggestion: responsePayload.experiment_suggestion,
      tags: responsePayload.tags,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save verdict' }, { status: 500 });
  }

  return NextResponse.json(data);
}
