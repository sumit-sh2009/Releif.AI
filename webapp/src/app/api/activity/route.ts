import { NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function GET() {
  try {
    const activity = await Database.activity.getRecent(20);
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
