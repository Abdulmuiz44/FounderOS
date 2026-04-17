import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { getServerUser } from '@/utils/supabase/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getServerUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const opportunities = await opportunityService.getOpportunities(user.id);

        return NextResponse.json({ opportunities });
    } catch (error) {
        console.error('Error listing opportunities:', error);
        return NextResponse.json({ error: 'Failed to list opportunities' }, { status: 500 });
    }
}
