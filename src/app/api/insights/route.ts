import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateInsight } from '@/lib/insights/generator';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('builder_insights')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore 'no rows found' error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

// Triggered by Patterns update
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
