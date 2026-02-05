import { createClient } from '@supabase/supabase-js';
import { Opportunity, OpportunityScore, MonetizationMap, ExecutionPlan } from '../types';

// We reuse the environment variables but instantiate a fresh client or reuse a singleton if we had one.
// Since `src/services/db.ts` has a singleton, we can adapt or just import it.
// However, seeing `src/services/db.ts` uses a custom `getSupabase` function, let's verify if we can export it or if we should just replicate the client creation.
// Looking at `src/services/db.ts` it exports `saveBriefForUser` etc. but `getSupabase` is local.
// I will create a robust client here or check if I can modify db.ts to export the getter.
// For now, I'll assume standard client creation to be safe and independent.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Note: In server components/API routes, we should use the service role key for admin tasks
// or the auth-context client from @supabase/ssr for user-context tasks.
// For this service layer, we will accept a client or default to admin if needed.

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export const opportunityService = {
    async createOpportunity(data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: string, founder_id: string }) {
        const { data: opp, error } = await adminClient
            .from('opportunities')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return opp as Opportunity;
    },

    async getOpportunities(founderId: string) {
        const { data, error } = await adminClient
            .from('opportunities')
            .select('*')
            .eq('founder_id', founderId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Opportunity[];
    },

    async getOpportunityById(id: string) {
        const { data, error } = await adminClient
            .from('opportunities')
            .select(`
        *,
        opportunity_scores (*),
        monetization_maps (*),
        execution_plans (*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data; // Returns aggregate type
    },

    async saveScore(score: Omit<OpportunityScore, 'id' | 'created_at'>) {
        const { data, error } = await adminClient
            .from('opportunity_scores')
            .upsert(score, { onConflict: 'opportunity_id' })
            .select()
            .single();

        if (error) throw error;
        return data as OpportunityScore;
    },

    async saveMonetization(map: Omit<MonetizationMap, 'id' | 'created_at'>) {
        const { data, error } = await adminClient
            .from('monetization_maps')
            .upsert(map, { onConflict: 'opportunity_id' })
            .select()
            .single();

        if (error) throw error;
        return data as MonetizationMap;
    },

    async saveExecutionPlan(plan: Omit<ExecutionPlan, 'id' | 'created_at'>) {
        const { data, error } = await adminClient
            .from('execution_plans')
            .upsert(plan, { onConflict: 'opportunity_id' })
            .select()
            .single();

        if (error) throw error;
        return data as ExecutionPlan;
    },

    async updateStatus(id: string, status: string) {
        const { data, error } = await adminClient
            .from('opportunities')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Opportunity;
    }
};
