import { NextRequest, NextResponse } from 'next/server';
import { FirstAidService } from '@/lib/services/first-aid/first-aid-service';
import { getAIProvider } from '@/lib/providers';
import { FirstAidRequest } from '@/types/first-aid';

const firstAidService = new FirstAidService(getAIProvider());

export async function POST(request: NextRequest) {
  try {
    const body: FirstAidRequest = await request.json();
    
    if (!body.emergencyDescription) {
      return NextResponse.json({ error: 'Missing emergencyDescription' }, { status: 400 });
    }

    const guidance = await firstAidService.getGuidance(body);
    
    return NextResponse.json(guidance, { status: 200 });
  } catch (error) {
    console.error('Error generating first aid guidance:', error);
    return NextResponse.json({ error: 'Failed to generate guidance' }, { status: 500 });
  }
}
