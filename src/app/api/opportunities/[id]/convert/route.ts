import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth'; // Import auth helper

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth(); // Get current session

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 1. Get the opportunity details
        const { data: opp, error: oppError } = await supabase
            .from('opportunities')
            .select('*')
            .eq('id', id)
            .single();

        if (oppError || !opp) {
            return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
        }

        // 2. Create a new Project from this Opportunity
        // Use session.user.id to ensure we have a valid user_id even if the opportunity record is missing it
        const { data: project, error: projError } = await supabase
            .from('projects')
            .insert({
                user_id: session.user.id, // Enforce current user
                name: opp.title,
                description: opp.problem_statement,
                audience: opp.target_niche,
                current_goal: 'Execute MVP Plan',
                opportunity_id: opp.id,
                status: 'active'
            })
            .select()
            .single();

        if (projError) {
            console.error('Project creation failed:', projError);
            return NextResponse.json({ error: 'Failed to create project', details: projError }, { status: 500 });
        }

        // 3. Update Opportunity Status
        await opportunityService.updateStatus(id, 'CONVERTED');

        return NextResponse.json({
            success: true,
            projectId: project.id,
            redirectUrl: `/dashboard/projects`
        });
    } catch (error) {
        console.error('Error converting opportunity:', error);
        return NextResponse.json({ error: 'Failed to convert opportunity' }, { status: 500 });
    }
}
