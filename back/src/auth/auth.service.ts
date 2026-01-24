import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AuthenticatedUser } from './types';

export class AuthService {
  getUserFromRequest(request: NextRequest): AuthenticatedUser | null {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyToken(token);
      return { userId: payload.userId };
    } catch {
      return null;
    }
  }
}
