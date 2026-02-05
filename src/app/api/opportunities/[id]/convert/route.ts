import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // In a real implementation:
        // 1. Fetch opportunity execution plan
        // 2. Call ProjectService.createProject() with the plan data
        // 3. Link them back

        // For now, we mock the conversion and update status

        const updated = await opportunityService.updateStatus(id, 'CONVERTED');

        return NextResponse.json({
            success: true,
            projectId: 'mock-project-id',
            redirectUrl: `/dashboard/projects/mock-project-id`
        });
    } catch (error) {
        console.error('Error converting opportunity:', error);
        return NextResponse.json({ error: 'Failed to convert opportunity' }, { status: 500 });
    }
}
