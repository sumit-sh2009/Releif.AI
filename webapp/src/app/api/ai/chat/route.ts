import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const centreUrl = process.env.AI_CENTRE_URL;
  if (!centreUrl) {
    return NextResponse.json({ error: 'AI Centre not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${centreUrl.replace(/\/$/, '')}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('AI chat proxy error:', error);
    return NextResponse.json({ error: 'Failed to reach AI Centre' }, { status: 502 });
  }
}
