import { NextRequest, NextResponse } from 'next/server';
import { getAuthService, getGetHabitsService, getUpsertHabitsService } from '@/lib/container';

export async function GET(request: NextRequest) {
  console.log('[GET /api/habits] Request received');
  console.log('[GET /api/habits] Headers:', Object.fromEntries(request.headers.entries()));

  const authService = getAuthService();
  const user = authService.getUserFromRequest(request);
  console.log('[GET /api/habits] User:', user);

  if (!user) {
    console.log('[GET /api/habits] Unauthorized - no user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const service = getGetHabitsService();
    console.log('[GET /api/habits] Calling service.execute');
    const result = await service.execute({ user });
    console.log('[GET /api/habits] Success:', JSON.stringify(result).slice(0, 200));
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GET /api/habits] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  console.log('[PUT /api/habits] Request received');
  console.log('[PUT /api/habits] Headers:', Object.fromEntries(request.headers.entries()));

  const authService = getAuthService();
  const user = authService.getUserFromRequest(request);
  console.log('[PUT /api/habits] User:', user);

  if (!user) {
    console.log('[PUT /api/habits] Unauthorized - no user');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    console.log('[PUT /api/habits] Body:', JSON.stringify(body).slice(0, 200));
    const service = getUpsertHabitsService();
    const result = await service.execute({ user, dto: body });
    console.log('[PUT /api/habits] Success');
    return NextResponse.json(result);
  } catch (error) {
    console.error('[PUT /api/habits] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
