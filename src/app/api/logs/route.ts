import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  // Trigger Pattern Analysis (Fire and forget or await depending on needs)
  // For MVP, we await to ensure data consistency, but in prod could be background
  try {
    const { headers } = request;
    // We can't easily call our own API route via fetch with auth headers passed automatically in this environment
    // So we will just import the logic or simply let the client trigger the refresh, OR better:
    // We duplicate the analysis trigger logic here for simplicity, OR better:
    // We make a fetch call to the absolute URL. 
    // BUT safest for this environment: Just run the analysis logic directly here or via a shared lib function.
    // However, since we defined the logic in POST /api/patterns, let's keep it decoupled. 
    // We will assume the CLIENT triggers a refresh, OR we do a fetch.
    
    // Actually, let's call the pattern analysis URL if we can construct it, 
    // otherwise just rely on the client or next refresh.
    // simpler: The dashboard will fetch patterns on load. The user sees updated patterns next time.
    // But to make it "Live", let's try to call it.
    
    // For this environment, let's just let the client handle fetching new patterns, 
    // or the user will see them updated on next reload. 
    // Wait! The requirement says "run whenever a new log is created".
    // I should probably call the analysis directly here to be robust.
    
    // Let's rely on the client to re-fetch or let's invoke the function directly?
    // Direct invocation is messy due to Next.js Request/Response types.
    // Let's do a fetch to localhost if possible, else skip.
    // actually, let's simply make the client call it.
    
    // REVISION: I will add a fetch call here to the patterns endpoint.
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    if (host) {
       // Fire and forget
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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
