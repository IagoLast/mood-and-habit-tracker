import { NextRequest, NextResponse } from 'next/server';
import { getAuthService, getGetHabitsService, getUpsertHabitsService } from '@/lib/container';

export async function GET(request: NextRequest) {
  const authService = getAuthService();
  const user = authService.getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const service = getGetHabitsService();
    const result = await service.execute({ user });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authService = getAuthService();
  const user = authService.getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const service = getUpsertHabitsService();
    const result = await service.execute({ user, dto: body });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
