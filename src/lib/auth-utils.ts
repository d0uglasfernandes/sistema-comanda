import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

export async function getTenantFromRequest(request: NextRequest): Promise<string | null> {
  try {
    // Primeiro tenta pegar do header (setado pelo middleware)
    let tenantId = request.headers.get('x-tenant-id');
    
    if (tenantId) {
      return tenantId;
    }

    // Se não tiver no header, tenta pegar do token
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return null;
    }

    const payload = verifyAccessToken(accessToken);
    return payload.tenantId;
  } catch (error) {
    console.error('Error getting tenant from request:', error);
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; email: string; role: string; tenantId: string } | null> {
  try {
    // Primeiro tenta pegar dos headers (setados pelo middleware)
    const userId = request.headers.get('x-user-id');
    const email = request.headers.get('x-user-email');
    const role = request.headers.get('x-user-role');
    const tenantId = request.headers.get('x-tenant-id');
    
    if (userId && email && role && tenantId) {
      return { userId, email, role, tenantId };
    }

    // Se não tiver nos headers, tenta pegar do token
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return null;
    }

    const payload = verifyAccessToken(accessToken);
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}