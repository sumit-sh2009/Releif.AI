import { NextRequest, NextResponse } from 'next/server';
import { RequestService } from '@/lib/services/emergency-requests/request-service';

const requestService = new RequestService();

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 });
    }

    const req = await requestService.getRequestByCode(code);
    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(req);
  } catch (error) {
    console.error('Error tracking request:', error);
    return NextResponse.json({ error: 'Failed to track request' }, { status: 500 });
  }
}
