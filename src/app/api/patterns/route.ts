import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analyzeMomentum, analyzeFocus, analyzeExecution, analyzeFriction } from '@/lib/patterns/engine';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('builder_patterns')
    .select('*')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Internal trigger endpoint (called by log creation or cron)
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Fetch recent logs
  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50); // Analyze last 50 logs

  if (!logs) return NextResponse.json({ processed: false });

  // 2. Run Analysis
  const momentum = analyzeMomentum(logs);
  const focus = analyzeFocus(logs);
  const execution = analyzeExecution(logs);
  const friction = analyzeFriction(logs);

  const patterns = [momentum, focus, execution, friction];

  // 3. Save Patterns
  for (const p of patterns) {
    await supabase.from('builder_patterns').upsert({
      user_id: user.id,
      pattern_type: p.pattern_type,
      pattern_label: p.pattern_label,
      explanation: p.explanation,
      confidence_score: p.confidence_score,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, pattern_type' });
  }

  return NextResponse.json({ success: true });
}
