import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { createClient } from '@supabase/supabase-js';
import { generateInsight } from '@/lib/insights/generator';

// Use service role client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const user = await getServerUser();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('builder_insights')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching insights:', error);
  }

  return NextResponse.json(data || null);
}

// Triggered by Patterns update
export async function POST(request: Request) {
  const user = await getServerUser();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch current patterns
  const { data: patterns } = await supabase
    .from('builder_patterns')
    .select('*')
    .eq('user_id', user.id);

  if (!patterns || patterns.length === 0) {
    return NextResponse.json({ processed: false, reason: 'no_patterns' });
  }

  // 2. Generate Insight
  const insightText = generateInsight(patterns);

  // 3. Save Insight
  const { data, error } = await supabase
    .from('builder_insights')
    .upsert({
      user_id: user.id,
      insight_text: insightText,
      generated_from_patterns: patterns,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving insight:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Trigger Profile Update (Fire and forget)
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  if (host) {
    fetch(`${protocol}://${host}/api/profile`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    }).catch(err => console.error("Profile trigger failed", err));
  }

  return NextResponse.json(data);
}

