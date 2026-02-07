import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { createClient } from '@supabase/supabase-js';
import { analyzeMomentum, analyzeFocus, analyzeExecution, analyzeFriction } from '@/lib/patterns/engine';

// Use service role client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('builder_patterns')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json([]);
  }

  return NextResponse.json(data || []);
}

// Internal trigger endpoint (called by log creation or cron)
export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch recent logs
  const { data: logs } = await supabase
    .from('logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50); // Analyze last 50 logs

  if (!logs || logs.length === 0) {
    return NextResponse.json({ processed: false, message: 'No logs to analyze' });
  }

  // 2. Run Analysis
  const momentum = analyzeMomentum(logs);
  const focus = analyzeFocus(logs);
  const execution = analyzeExecution(logs);
  const friction = analyzeFriction(logs);

  const patterns = [momentum, focus, execution, friction];

  // 3. Save Patterns
  for (const p of patterns) {
    const { error } = await supabase.from('builder_patterns').upsert({
      user_id: user.id,
      pattern_type: p.pattern_type,
      pattern_label: p.pattern_label,
      explanation: p.explanation,
      confidence_score: p.confidence_score,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, pattern_type' });

    if (error) {
      console.error('Error upserting pattern:', error);
    }
  }

  // 4. Trigger Insight Update (Fire and forget)
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  if (host) {
    fetch(`${protocol}://${host}/api/insights`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    }).catch(err => console.error("Insight trigger failed", err));
  }

  return NextResponse.json({ success: true, patterns: patterns.length });
}
