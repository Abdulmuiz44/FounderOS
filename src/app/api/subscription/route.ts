import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { createServiceClient } from '@/utils/supabase/service';

export async function GET() {
  try {
    const supabase = createServiceClient();
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch subscription for user
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['active', 'on_trial', 'past_due', 'paused'])
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      return NextResponse.json(null);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

