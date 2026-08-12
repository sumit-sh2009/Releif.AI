import { NextRequest, NextResponse } from 'next/server';
import { VolunteerService } from '@/lib/services/volunteers/volunteer-service';
import { RequestService } from '@/lib/services/emergency-requests/request-service';

const requestService = new RequestService();
const volunteerService = new VolunteerService(requestService);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: volunteerId } = await params;
    const completedVolunteer = await volunteerService.completeMission(volunteerId);
    
    return NextResponse.json(completedVolunteer, { status: 200 });
  } catch (error: any) {
    console.error('Error completing mission:', error);
    return NextResponse.json({ error: error.message || 'Failed to complete mission' }, { status: 500 });
  }
}
