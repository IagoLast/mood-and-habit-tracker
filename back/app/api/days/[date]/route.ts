import { NextRequest, NextResponse } from 'next/server';
import { getAuthService, getGetDayService, getUpdateDayService } from '@/lib/container';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const authService = getAuthService();
  const user = authService.getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { date } = await params;
    const service = getGetDayService();
    const result = await service.execute({ user, date });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const authService = getAuthService();
  const user = authService.getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { date } = await params;
    const body = await request.json();
    const service = getUpdateDayService();
    const result = await service.execute({ user, date, dto: body });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    const status = message === 'Date mismatch' ? 400 : message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
