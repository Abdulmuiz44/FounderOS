import { NextRequest, NextResponse } from 'next/server';
import { validator } from '@/modules/opportunity-intelligence/core/validator';
import { monetizer } from '@/modules/opportunity-intelligence/core/visualizer';
import { bridge } from '@/modules/opportunity-intelligence/core/bridge';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { Opportunity } from '@/modules/opportunity-intelligence/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { opportunityId, opportunityData } = body;

        let opportunity: Opportunity;

        if (opportunityId) {
            opportunity = await opportunityService.getOpportunityById(opportunityId);
        } else {
            opportunity = opportunityData;
        }

        if (!opportunity) {
            return NextResponse.json({ error: 'Opportunity not found or provided' }, { status: 404 });
        }

        // Parallel execution for speed
        const [scores, monetization, plan] = await Promise.all([
            validator.validate(opportunity),
            monetizer.mapStrategies(opportunity),
            bridge.createPlan(opportunity)
        ]);

        // Save results if it's an existing opportunity
        if (opportunityId) {
            await Promise.all([
                opportunityService.saveScore({ ...scores, opportunity_id: opportunityId }),
                opportunityService.saveMonetization({ ...monetization, opportunity_id: opportunityId }),
                opportunityService.saveExecutionPlan({ ...plan, opportunity_id: opportunityId }),
                opportunityService.updateStatus(opportunityId, 'VALIDATED')
            ]);
        }

        return NextResponse.json({
            scores,
            monetization,
            plan
        });
    } catch (error) {
        console.error('Error validating opportunity:', error);
        return NextResponse.json({ error: 'Failed to validate opportunity' }, { status: 500 });
    }
}
