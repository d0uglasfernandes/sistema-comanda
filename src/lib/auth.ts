import { NextRequest } from 'next/server';
import { verifyAccessToken } from './jwt';

export async function getUserFromRequest(request: NextRequest) {
  try {
    // First try to get from headers (set by middleware)
    const tenantId = request.headers.get('x-tenant-id');
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    
    if (tenantId && userId && userEmail && userRole) {
      return {
        userId,
        email: userEmail,
        role: userRole,
        tenantId,
      };
    }
    
    // Fallback: get from token directly
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