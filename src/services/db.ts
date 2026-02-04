/// <reference types="node" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BuilderBrief } from '../types/brief';

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not configured');
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseInstance;
}

export async function saveBriefForUser(brief: BuilderBrief, userId: string) {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const weekStartDate = new Date(today.setDate(diff)).toISOString().split('T')[0];

  const { error } = await getSupabase()
    .from('founder_briefs')
    .upsert({
      user_id: userId,
      week_start_date: weekStartDate,
      executive_summary: brief.executiveSummary,
      key_observations: brief.keyObservations,
      meaning: brief.meaning,
      founder_focus: brief.founderFocus,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,week_start_date'
    });

  if (error) console.error("Error saving brief:", error);
}

export async function saveBriefToDB(brief: BuilderBrief, email: string) {
  // Query the users table directly instead of using auth.admin
  const { data: user, error } = await getSupabase()
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.error("Error finding user:", error);
    return;
  }

  await saveBriefForUser(brief, user.id);
}