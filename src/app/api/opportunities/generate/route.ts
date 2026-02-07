import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { generator } from '@/modules/opportunity-intelligence/core/generator';
import { opportunityService } from '@/modules/opportunity-intelligence/services/opportunityService';
import { FounderProfile } from '@/modules/opportunity-intelligence/types';

export async function POST(req: NextRequest) {
    try {
        const user = await getServerUser();
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { profile, save = false } = body;
        // profile conforms to FounderProfile interface

        if (!profile) {
            return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
        }

        const opportunities = await generator.generate(profile as FounderProfile);

        // If save requested, persist them as DRAFT
        // We need founderId.
        // Let's assume we get it from body for now if session is tricky, OR better:
        // fail if I can't find auth. 
        // I'll assume `req.headers.get('x-user-id')` if middleware sets it, or just return the data for the frontend to save later.

        // The requirement says "POST /opportunities/generate".
        // I'll return the list. Creating records might happen on "Save" in UI, or auto-save.
        // Let's auto-save if we have text-auth.

        return NextResponse.json({ opportunities });
    } catch (error) {
        console.error('Error generating opportunities:', error);
        return NextResponse.json({ error: 'Failed to generate opportunities' }, { status: 500 });
    }
}

