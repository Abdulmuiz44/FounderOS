import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { classifyProfile } from '@/lib/profile/classifier';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('builder_os_profile')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

// Triggered by Insight update (or Pattern update)
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

  // 2. Classify Profile
  const profile = classifyProfile(patterns);

  // 3. Save Profile
  const { data, error } = await supabase
    .from('builder_os_profile')
    .upsert({
      user_id: user.id,
      builder_mode: profile.builder_mode,
      dominant_pattern: profile.dominant_pattern,
      execution_style: profile.execution_style,
      friction_type: profile.friction_type,
      summary_label: profile.summary_label,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
