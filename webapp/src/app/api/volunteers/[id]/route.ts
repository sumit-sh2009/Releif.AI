import { NextRequest, NextResponse } from 'next/server';
import { VolunteerService } from '@/lib/services/volunteers/volunteer-service';
import { RequestService } from '@/lib/services/emergency-requests/request-service';
import { Database } from '@/lib/database';

const requestService = new RequestService();
const volunteerService = new VolunteerService(requestService);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vol = await volunteerService.getVolunteerById(id);
    
    if (!vol) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }
    
    return NextResponse.json(vol);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch volunteer' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const vol = await Database.volunteers.update(id, body);
    
    if (!vol) {
      return NextResponse.json({ error: 'Volunteer not found' }, { status: 404 });
    }
    
    return NextResponse.json(vol);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update volunteer' }, { status: 500 });
  }
}
