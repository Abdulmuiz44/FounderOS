import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { createClient } from '@supabase/supabase-js';
import { classifyProfile } from '@/lib/profile/classifier';

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
    .from('builder_os_profile')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
  }

  return NextResponse.json(data || null);
}

// Triggered by Insight update (or Pattern update)
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

  if (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Trigger Drift Analysis (Fire and forget)
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  if (host) {
    fetch(`${protocol}://${host}/api/drift`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    }).catch(err => console.error("Drift trigger failed", err));
  }

  return NextResponse.json(data);
}

