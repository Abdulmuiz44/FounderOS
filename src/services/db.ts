import { createClient } from '@supabase/supabase-js';
import { FounderBrief } from '../types/brief';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function saveBriefForUser(brief: FounderBrief, userId: string) {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); 
  const weekStartDate = new Date(today.setDate(diff)).toISOString().split('T')[0];

  const { error } = await supabase
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

export async function saveBriefToDB(brief: FounderBrief, email: string) {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error || !users.users) return;
  const user = users.users.find(u => u.email === email);
  if (user) await saveBriefForUser(brief, user.id);
}