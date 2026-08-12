import { NextRequest, NextResponse } from 'next/server';
import { RequestService } from '@/lib/services/emergency-requests/request-service';
import { EmergencyRequest } from '@/types/emergency-request';

const requestService = new RequestService();

export async function GET() {
  try {
    const requests = await requestService.getAllRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching emergency requests:', error);
    return NextResponse.json({ error: 'Failed to fetch emergency requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'requestCode'> =
      await request.json();

    if (!body.emergencyType || !body.description || !body.location || !body.priority) {
      return NextResponse.json({ error: 'Missing required request fields' }, { status: 400 });
    }

    const newReq = await requestService.createRequest({
      ...body,
      peopleAffected: body.peopleAffected ?? 1,
    });
    
    return NextResponse.json(newReq, { status: 201 });
  } catch (error) {
    console.error('Error creating emergency request:', error);
    return NextResponse.json({ error: 'Failed to create emergency request' }, { status: 500 });
  }
}
