import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { createClient } from '@supabase/supabase-js';

// Use service role client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, content, log_type } = body;

  const { data, error } = await supabase
    .from('logs')
    .insert({
      user_id: user.id,
      project_id,
      content,
      log_type
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger Pattern Analysis (Fire and forget)
  try {
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    if (host) {
      fetch(`${protocol}://${host}/api/patterns`, {
        method: 'POST',
        headers: {
          cookie: request.headers.get('cookie') || ''
        }
      }).catch(err => console.error("Pattern trigger failed", err));
    }
  } catch (e) {
    // ignore
  }

  return NextResponse.json(data);
}

export async function GET(request: Request) {
  const user = await getServerUser();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');

  let query = supabase.from('logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

