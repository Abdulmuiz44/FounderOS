import { NextResponse } from 'next/server';
import { generateFounderBrief } from '@/core/engine/generateFounderBrief';

export async function GET() {
  try {
    const brief = await generateFounderBrief();
    return NextResponse.json(brief);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate brief' },
      { status: 500 }
    );
  }
}
