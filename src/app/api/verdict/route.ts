import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check subscription (Mock check - usually query 'subscriptions' table)
  // For MVP, we might skip strict check or assume checks are done in UI/Middleware
  // const { data: sub } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single();
  // if (!sub || sub.status !== 'active') return NextResponse.json({ error: 'Subscription required' }, { status: 403 });

  const body = await request.json();
  const { building, audience, summary, blockers, uncertainties } = body;

  // Mock AI Verdict Generation
  // In a real app, call OpenAI/Gemini here with the system prompt
  
  const verdicts = ['continue', 'pivot', 'simplify'];
  const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
  
  const mockResponse = {
    verdict_type: randomVerdict,
    explanation: `Based on your work on ${building}, we see strong signals to ${randomVerdict}. The market for ${audience} is responding well to consistency.`,
    focus_for_next_week: "Focus on reducing friction in the onboarding flow.",
    experiment_suggestion: "Try a ' concierge' onboarding for the next 5 users to understand the drop-off.",
    tags: ['Momentum', 'Stable']
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
