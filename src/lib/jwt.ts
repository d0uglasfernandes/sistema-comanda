import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(payload: JWTPayload): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
}

export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return null;
    }

    const payload = verifyAccessToken(accessToken);
    return payload;
  } catch (error) {
    return null;
  }
}