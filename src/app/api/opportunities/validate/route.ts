import { NextRequest, NextResponse } from 'next/server';
import { validator } from '@/modules/opportunity-intelligence/core/validator';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { Opportunity } from '@/modules/opportunity-intelligence/types';

export async function POST(req: NextRequest) {
    let opportunityId: string | undefined;

    try {
        const body = await req.json();
        opportunityId = body.opportunityId;
        const { opportunityData } = body;

        let opportunity: Opportunity;

        if (opportunityId) {
            opportunity = await opportunityService.getOpportunityById(opportunityId);
        } else {
            opportunity = opportunityData;
        }

        if (!opportunity) {
            return NextResponse.json({ error: 'Opportunity not found or provided' }, { status: 404 });
        }

        if (opportunityId) {
            await opportunityService.updateStatus(opportunityId, 'VALIDATING');
        }

        const scores = await validator.validate(opportunity);

        if (opportunityId) {
            await opportunityService.saveScore({ ...scores, opportunity_id: opportunityId });
            await opportunityService.updateStatus(opportunityId, 'VALIDATED');
        }

        return NextResponse.json({ scores });
    } catch (error) {
        console.error('Error validating opportunity:', error);
        if (opportunityId) {
            await opportunityService.updateStatus(opportunityId, 'VALIDATION_FAILED');
        }
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to validate opportunity'
        }, { status: 500 });
    }
}