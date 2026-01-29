// @ts-nocheck
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ChatterMetrics, BuilderModeType } from '@/types/schema_v2';

// Calculate builder mode based on chatter ratio
function calculateBuilderMode(ratio: number, recentTrend: number): BuilderModeType {
    if (ratio < 0.3) return 'deep_flow';           // Less than 30% AI chat
    if (ratio < 0.5) return 'balanced_building';   // 30-50% AI chat
    if (ratio >= 0.7) return 'planning_loop';      // 70%+ AI chat = danger zone
    if (recentTrend < -0.1) return 'momentum_decay'; // Execution dropping
    return 'balanced_building';
}

// GET: Fetch chatter metrics for current user
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the last 7 days of chatter metrics
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: metrics, error } = await supabase
            .from('chatter_metrics')
            .select('*')
            .eq('user_id', user.id)
            .gte('session_date', sevenDaysAgo.toISOString().split('T')[0])
            .order('session_date', { ascending: false });

        if (error) {
            console.error('Error fetching chatter metrics:', error);
            // Return mock data for demo purposes
            return NextResponse.json({
                current_ratio: 0.45,
                weekly_average: 0.42,
                builder_mode: 'balanced_building',
                trend: 'stable',
                ai_minutes_today: 45,
                execution_minutes_today: 55,
                top_model: 'claude-3.5',
                warning: null
            });
        }

        if (!metrics || metrics.length === 0) {
            // Return starter data for new users
            return NextResponse.json({
                current_ratio: 0,
                weekly_average: 0,
                builder_mode: 'deep_flow',
                trend: 'no_data',
                ai_minutes_today: 0,
                execution_minutes_today: 0,
                top_model: null,
                warning: null
            });
        }

        // Calculate aggregates
        const totalAiMinutes = metrics.reduce((sum, m) => sum + (m.ai_interaction_minutes || 0), 0);
        const totalExecMinutes = metrics.reduce((sum, m) => sum + (m.execution_minutes || 0), 0);
        const weeklyAverage = totalAiMinutes / (totalAiMinutes + totalExecMinutes) || 0;

        const todayMetrics = metrics[0];
        const currentRatio = todayMetrics?.chatter_ratio || weeklyAverage;

        // Calculate trend (compare first half vs second half of week)
        const midpoint = Math.floor(metrics.length / 2);
        const recentAvg = metrics.slice(0, midpoint).reduce((sum, m) => sum + m.chatter_ratio, 0) / midpoint || 0;
        const olderAvg = metrics.slice(midpoint).reduce((sum, m) => sum + m.chatter_ratio, 0) / (metrics.length - midpoint) || 0;
        const trend = recentAvg - olderAvg;

        const builderMode = calculateBuilderMode(currentRatio, trend);

        // Check for warning condition
        let warning = null;
        if (currentRatio >= 0.7) {
            warning = 'You are in a Planning Loop. Consider stopping AI interaction and shipping something.';
        } else if (trend > 0.15) {
            warning = 'Your chatter ratio is increasing. Momentum may be decaying.';
        }

        // Find most used model
        const modelCounts: Record<string, number> = {};
        metrics.forEach((m: ChatterMetrics) => {
            if (m.model_used) {
                modelCounts[m.model_used] = (modelCounts[m.model_used] || 0) + 1;
            }
        });
        const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        return NextResponse.json({
            current_ratio: Math.round(currentRatio * 100) / 100,
            weekly_average: Math.round(weeklyAverage * 100) / 100,
            builder_mode: builderMode,
            trend: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable',
            ai_minutes_today: todayMetrics?.ai_interaction_minutes || 0,
            execution_minutes_today: todayMetrics?.execution_minutes || 0,
            top_model: topModel,
            warning
        });

    } catch (error) {
        console.error('Chatter API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Log a new chatter session
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            project_id,
            ai_interaction_minutes,
            execution_minutes,
            model_used
        } = body;

        const totalMinutes = ai_interaction_minutes + execution_minutes;
        const chatter_ratio = totalMinutes > 0 ? ai_interaction_minutes / totalMinutes : 0;

        const { data, error } = await supabase
            .from('chatter_metrics')
            .insert({
                user_id: user.id,
                project_id,
                ai_interaction_minutes,
                execution_minutes,
                chatter_ratio,
                model_used,
                session_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        if (error) {
            console.error('Error saving chatter metrics:', error);
            return NextResponse.json({ error: 'Failed to save metrics' }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Chatter POST Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
