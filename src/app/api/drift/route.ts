import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { createClient } from '@supabase/supabase-js';
import { calculateDrift } from '@/lib/profile/drift';

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
    .from('builder_os_drift')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching drift:', error);
  }

  return NextResponse.json(data || null);
}

// Triggered by Profile update
export async function POST(request: Request) {
  const user = await getServerUser();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Fetch Current Profile
  const { data: currentProfile } = await supabase
    .from('builder_os_profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!currentProfile) {
    return NextResponse.json({ processed: false, reason: 'no_profile' });
  }

  // 2. Fetch Latest History Snapshot (Previous state)
  const { data: history } = await supabase
    .from('builder_os_history')
    .select('*')
    .eq('user_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Calculate Drift
  const driftResult = calculateDrift(currentProfile, history);

  // 4. Save New Snapshot to History (for next time)
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

  if (error) {
    console.error('Error saving drift:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

