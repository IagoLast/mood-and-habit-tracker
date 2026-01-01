const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
}

let joseModule: typeof import('jose') | null = null;

async function getJoseModule() {
  if (!joseModule) {
    joseModule = await import('jose');
  }
  return joseModule;
}

export async function generateToken(userId: string): Promise<string> {
  const { SignJWT } = await getJoseModule();
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { jwtVerify } = await getJoseModule();
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as string };
  } catch {
    throw new Error('Invalid or expired token');
  }
}
