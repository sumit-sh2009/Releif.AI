import { NextRequest, NextResponse } from 'next/server';
import { RequestService } from '@/lib/services/emergency-requests/request-service';
import { Database } from '@/lib/database';

const requestService = new RequestService();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const req = await requestService.getRequestById(id);
    
    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json(req);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch emergency request' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const req = await Database.emergencyRequests.update(id, body);
    
    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json(req);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update emergency request' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await Database.emergencyRequests.delete(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete emergency request' }, { status: 500 });
  }
}
