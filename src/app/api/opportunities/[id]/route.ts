import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const opportunity = await opportunityService.getOpportunityById(id);

        if (!opportunity) {
            return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
        }

        return NextResponse.json(opportunity);
    } catch (error) {
        console.error('Error fetching opportunity:', error);
        return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
    }
}
