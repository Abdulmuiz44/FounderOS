import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const opportunities = await opportunityService.getOpportunities(userId);

        return NextResponse.json({ opportunities });
    } catch (error) {
        console.error('Error listing opportunities:', error);
        return NextResponse.json({ error: 'Failed to list opportunities' }, { status: 500 });
    }
}
