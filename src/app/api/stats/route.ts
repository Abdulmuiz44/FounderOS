import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role client to access all data
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        // Get total logs count
        const { count: logsCount, error: logsError } = await supabase
            .from('logs')
            .select('*', { count: 'exact', head: true });

        // Get total projects count
        const { count: projectsCount, error: projectsError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        // Get active subscriptions count
        const { count: activeSubsCount, error: subsError } = await supabase
            .from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .in('status', ['active', 'on_trial']);

        return NextResponse.json({
            users: usersCount || 0,
            logs: logsCount || 0,
            projects: projectsCount || 0,
            activeSubscriptions: activeSubsCount || 0,
            // Calculate a "productivity boost" metric (e.g., logs per user avg)
            avgLogsPerUser: usersCount && usersCount > 0 ? Math.round((logsCount || 0) / usersCount) : 0
        });
    } catch (error) {
        console.error('Stats fetch error:', error);
        return NextResponse.json({
            users: 0,
            logs: 0,
            projects: 0,
            activeSubscriptions: 0,
            avgLogsPerUser: 0
        });
    }
}
