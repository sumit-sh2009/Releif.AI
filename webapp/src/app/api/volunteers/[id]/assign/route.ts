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
    const body = await request.json();
    
    const { requestId } = body;
    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId in body' }, { status: 400 });
    }

    const assignedVolunteer = await volunteerService.assignToRequest(volunteerId, requestId);
    
    return NextResponse.json(assignedVolunteer, { status: 200 });
  } catch (error: any) {
    console.error('Error assigning volunteer:', error);
    return NextResponse.json({ error: error.message || 'Failed to assign volunteer' }, { status: 500 });
  }
}
