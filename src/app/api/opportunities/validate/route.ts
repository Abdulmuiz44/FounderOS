import { NextRequest, NextResponse } from 'next/server';
import { validator } from '@/modules/opportunity-intelligence/core/validator';
import { monetizer } from '@/modules/opportunity-intelligence/core/visualizer';
import { bridge } from '@/modules/opportunity-intelligence/core/bridge';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { Opportunity } from '@/modules/opportunity-intelligence/types';

export async function POST(req: NextRequest) {
    let opportunityId: string | undefined;

    const toErrorMessage = (reason: unknown): string => {
        if (reason instanceof Error) return reason.message;
        if (typeof reason === 'string') return reason;
        try {
            return JSON.stringify(reason);
        } catch {
            return 'Unknown error';
        }
    };

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

        const [scoresResult, monetizationResult, planResult] = await Promise.allSettled([
            validator.validate(opportunity),
            monetizer.mapStrategies(opportunity),
            bridge.createPlan(opportunity)
        ]);

        if (scoresResult.status === 'rejected') {
            throw scoresResult.reason;
        }

        const scores = scoresResult.value;
        const monetization = monetizationResult.status === 'fulfilled' ? monetizationResult.value : null;
        const plan = planResult.status === 'fulfilled' ? planResult.value : null;
        const partialFailures: { monetization: string | null; plan: string | null; persistence: string[] } = {
            monetization: monetizationResult.status === 'rejected' ? toErrorMessage(monetizationResult.reason) : null,
            plan: planResult.status === 'rejected' ? toErrorMessage(planResult.reason) : null,
            persistence: []
        };

        // Save results if it's an existing opportunity
        if (opportunityId) {
            await opportunityService.saveScore({ ...scores, opportunity_id: opportunityId });

            const saveTasks: Promise<unknown>[] = [];

            if (monetization) {
                saveTasks.push(opportunityService.saveMonetization({ ...monetization, opportunity_id: opportunityId }));
            }

            if (plan) {
                saveTasks.push(opportunityService.saveExecutionPlan({ ...plan, opportunity_id: opportunityId }));
            }

            const saveResults = await Promise.allSettled(saveTasks);
            const failedSaves = saveResults
                .filter((result) => result.status === 'rejected')
                .map((result) => toErrorMessage(result.reason));

            if (failedSaves.length > 0) {
                partialFailures.persistence = failedSaves;
            }

            await opportunityService.updateStatus(opportunityId, 'VALIDATED');
        }

        return NextResponse.json({
            scores,
            monetization,
            plan,
            partialFailures
        });
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
