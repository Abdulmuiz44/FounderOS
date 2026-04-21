import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/pricing';
  const next = rawNext.startsWith('/') ? rawNext : '/pricing';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'on_trial'])
          .maybeSingle();

        const redirectTo = subscription ? '/dashboard' : '/pricing';
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
