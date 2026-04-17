// @ts-nocheck
import { NextResponse } from 'next/server';
import { generateBuilderBrief } from '@/core/engine/generateBuilderBrief';
import { createClient } from '@/utils/supabase/server';
import { saveBriefForUser } from '@/services/db';

export async function GET() {
  try {
    const brief = await generateBuilderBrief();

    // Attempt to save if user is logged in
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await saveBriefForUser(brief, user.id);
    }

    return NextResponse.json(brief);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate brief' },
      { status: 500 }
    );
  }
}