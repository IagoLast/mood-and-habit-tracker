import { NextRequest, NextResponse } from 'next/server';
import { getAuthService, getListScoresService } from '@/lib/container';

export async function GET(request: NextRequest) {
  const authService = getAuthService();
  const user = authService.getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const service = getListScoresService();
    const result = await service.execute({
      user,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
