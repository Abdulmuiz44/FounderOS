import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { getServerUser } from '@/utils/supabase/auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getServerUser();
        const userId = user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { opportunity } = body;

        if (!opportunity) {
            return NextResponse.json({ error: 'Opportunity data required' }, { status: 400 });
        }

        // Prepare data
        const newOpp = await opportunityService.createOpportunity({
            ...opportunity,
            founder_id: userId,
            status: 'DRAFT'
        });

        return NextResponse.json({ success: true, opportunity: newOpp });
    } catch (error) {
        console.error('Error creating opportunity:', error);
        return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
    }
}

