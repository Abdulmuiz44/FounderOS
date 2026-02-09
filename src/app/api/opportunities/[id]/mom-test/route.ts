import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { validator } from '@/modules/opportunity-intelligence/core/validator';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        // Fetch Opportunity
        const { data: opportunity, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !opportunity) {
            return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
        }

        // Generate Script
        const script = await validator.generateMomTestScript(opportunity);

        return NextResponse.json({ script });

    } catch (error) {
        console.error('Failed to generate mom test script:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
