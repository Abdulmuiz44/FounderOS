import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mock AI Verdict Generation
  const body = await request.json();
  const { building, audience, summary, blockers, uncertainties } = body;

  const verdicts = ['continue', 'pivot', 'simplify'];
  const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
  
  const tagOptions = ['Momentum', 'Attention', 'Stable'];
  // Pick 1 random tag for now
  const randomTag = tagOptions[Math.floor(Math.random() * tagOptions.length)];

  const mockResponse = {
    verdict_type: randomVerdict,
    explanation: `Based on your work on ${building}, we see strong signals to ${randomVerdict}. The market for ${audience} is responding, but ${blockers ? 'blockers need addressing' : 'momentum is building'}.`,
    focus_for_next_week: "Focus on reducing friction in the user onboarding flow to improve conversion.",
    experiment_suggestion: "Implement a 'concierge' onboarding for the next 5 users to qualitatively understand drop-off points.",
    tags: [randomTag] 
  };

  // Save to DB
  const { data, error } = await supabase
    .from('verdicts')
    .insert({
      user_id: user.id,
      week_start_date: new Date().toISOString(),
      input_context: body,
      verdict_type: mockResponse.verdict_type,
      explanation: mockResponse.explanation,
      focus_for_next_week: mockResponse.focus_for_next_week,
      experiment_suggestion: mockResponse.experiment_suggestion,
      tags: mockResponse.tags
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving verdict:", error);
    return NextResponse.json({ error: 'Failed to save verdict' }, { status: 500 });
  }

  return NextResponse.json(data);
}
