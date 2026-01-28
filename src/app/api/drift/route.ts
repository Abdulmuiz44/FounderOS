import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { calculateDrift } from '@/lib/profile/drift';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('builder_os_drift')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || null);
}

// Triggered by Profile update
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Fetch Current Profile
  const { data: currentProfile } = await supabase
    .from('builder_os_profile')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!currentProfile) return NextResponse.json({ error: 'No profile found' }, { status: 404 });

  // 2. Fetch Latest History Snapshot (Previous state)
  const { data: history } = await supabase
    .from('builder_os_history')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle(); // Use maybeSingle to handle no history case safely

  // 3. Calculate Drift
  const driftResult = calculateDrift(currentProfile, history);

  // 4. Save New Snapshot to History (for next time)
  // Only save if it's different or if enough time passed? For MVP, save on every profile update.
  await supabase.from('builder_os_history').insert({
    user_id: user.id,
    builder_mode: currentProfile.builder_mode,
    execution_style: currentProfile.execution_style,
    dominant_pattern: currentProfile.dominant_pattern,
    friction_type: currentProfile.friction_type,
    recorded_at: new Date().toISOString()
  });

  // 5. Save Drift Summary
  const { data, error } = await supabase
    .from('builder_os_drift')
    .upsert({
      user_id: user.id,
      summary: driftResult.summary,
      severity: driftResult.severity,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
