import { NextRequest, NextResponse } from 'next/server';
import { VolunteerService } from '@/lib/services/volunteers/volunteer-service';
import { RequestService } from '@/lib/services/emergency-requests/request-service';
import { Volunteer } from '@/types/volunteer';

const requestService = new RequestService();
const volunteerService = new VolunteerService(requestService);

export async function GET() {
  try {
    const volunteers = await volunteerService.getAllVolunteers();
    return NextResponse.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<Volunteer, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'availability'> = await request.json();
    
    if (!body.name || !body.skills || !body.location) {
      return NextResponse.json({ error: 'Missing required volunteer fields' }, { status: 400 });
    }

    const newVol = await volunteerService.registerVolunteer(body);
    
    return NextResponse.json(newVol, { status: 201 });
  } catch (error) {
    console.error('Error registering volunteer:', error);
    return NextResponse.json({ error: 'Failed to register volunteer' }, { status: 500 });
  }
}
