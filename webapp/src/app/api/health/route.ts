import { NextResponse } from 'next/server';

async function checkService(url: string, label: string) {
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    return { service: label, status: res.ok ? 'online' : 'error', detail: data };
  } catch (error) {
    return {
      service: label,
      status: 'offline',
      detail: error instanceof Error ? error.message : 'unreachable',
    };
  }
}

export async function GET() {
  const engineUrl = process.env.AI_ENGINE_URL;
  const centreUrl = process.env.AI_CENTRE_URL;

  const checks = await Promise.all([
    engineUrl ? checkService(engineUrl, 'ai-engine') : Promise.resolve({ service: 'ai-engine', status: 'not_configured' }),
    centreUrl ? checkService(centreUrl, 'ai-centre') : Promise.resolve({ service: 'ai-centre', status: 'not_configured' }),
  ]);

  const allOnline = checks.every((c) => c.status === 'online');

  return NextResponse.json({
    status: allOnline ? 'healthy' : 'degraded',
    webapp: 'online',
    services: checks,
    timestamp: new Date().toISOString(),
  });
}
