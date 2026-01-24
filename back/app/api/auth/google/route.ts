import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthService } from '@/lib/container';

export async function POST(request: NextRequest) {
  console.log('[POST /api/auth/google] Request received');
  console.log('[POST /api/auth/google] Headers:', Object.fromEntries(request.headers.entries()));

  try {
    const body = await request.json();
    console.log('[POST /api/auth/google] Body:', { ...body, code: body.code?.slice(0, 20) + '...' });
    const service = getGoogleAuthService();
    console.log('[POST /api/auth/google] Calling service.execute');
    const result = await service.execute(body);
    console.log('[POST /api/auth/google] Success - user:', result.user?.email);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[POST /api/auth/google] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('required') || message.includes('must be strings') ? 400 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
