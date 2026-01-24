import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthService } from '@/lib/container';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = getGoogleAuthService();
    const result = await service.execute(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message.includes('required') || message.includes('must be strings') ? 400 : 401;
    return NextResponse.json({ error: message }, { status });
  }
}
