import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/utils/supabase/auth';
import { validator } from '@/modules/opportunity-intelligence/core/validator';
import { createClient } from '@supabase/supabase-js';

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const user = await getServerUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        console.log(`[MarketingCopy] Generating for ID: ${id}`);

        // Fetch Opportunity
        const { data: opportunity, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !opportunity) {
            console.error(`[MarketingCopy] Opportunity not found or DB error:`, error);
            return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
        }

        console.log(`[MarketingCopy] Found opportunity: ${opportunity.title}`);

        // Generate Marketing Copy
        try {
            const copy = await validator.generateMarketingCopy(opportunity);
            console.log(`[MarketingCopy] Successfully generated copy`);
            return NextResponse.json({ copy });
        } catch (vError: any) {
            console.error(`[MarketingCopy] Validator failed:`, vError);
            return NextResponse.json({ error: vError.message || 'Validation failed' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[MarketingCopy] Critical error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
