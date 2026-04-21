import { Opportunity, OpportunityScore, MonetizationMap, ExecutionPlan } from '../types';
import { createServiceClient } from '@/utils/supabase/service';

function getAdminClient() {
    return createServiceClient();
}

export const opportunityService = {
    async createOpportunity(data: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: string, founder_id: string }) {
        const adminClient = getAdminClient();
        const { data: opp, error } = await adminClient
            .from('opportunities')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return opp as Opportunity;
    },

    async getOpportunities(founderId: string) {
        const adminClient = getAdminClient();
        const { data, error } = await adminClient
            .from('opportunities')
            .select('*')
            .eq('founder_id', founderId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Opportunity[];
    },

    async getOpportunityById(id: string) {
        const adminClient = getAdminClient();
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
        const adminClient = getAdminClient();
        const { data, error } = await adminClient
            .from('opportunity_scores')
            .upsert(score, { onConflict: 'opportunity_id' })
            .select()
            .single();

        if (error) throw error;
        return data as OpportunityScore;
    },

    async saveMonetization(map: Omit<MonetizationMap, 'id' | 'created_at'>) {
        const adminClient = getAdminClient();
        const { data, error } = await adminClient
            .from('monetization_maps')
            .upsert(map, { onConflict: 'opportunity_id' })
            .select()
            .single();

        if (error) throw error;
        return data as MonetizationMap;
    },

    async saveExecutionPlan(plan: Omit<ExecutionPlan, 'id' | 'created_at'>) {
        const adminClient = getAdminClient();
        const { data, error } = await adminClient
            .from('execution_plans')
            .upsert(plan, { onConflict: 'opportunity_id' })
            .select()
            .single();

        if (error) throw error;
        return data as ExecutionPlan;
    },

    async updateStatus(id: string, status: string) {
        const adminClient = getAdminClient();
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
