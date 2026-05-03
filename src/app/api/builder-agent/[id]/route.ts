import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { builderService } from '@/modules/builder-agent';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: opportunityId } = await params;
        const plan = await builderService.getPlanByOpportunity(opportunityId, user.id);

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json(plan);
    } catch (error) {
        console.error('Get builder plan error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to get builder plan'
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: opportunityId } = await params;
        const existingPlan = await builderService.getPlanByOpportunity(opportunityId, user.id);

        if (!existingPlan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        await builderService.deletePlan(existingPlan.id, user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete builder plan error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to delete builder plan'
        }, { status: 500 });
    }
}