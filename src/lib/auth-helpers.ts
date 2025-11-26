import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { getAuthCookies } from '@/lib/cookies';

export async function withAuth(request: NextRequest) {
  const { accessToken } = await getAuthCookies();
  
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const payload = verifyAccessToken(accessToken);
    return payload;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export function withRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const authResult = await withAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult as any;
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return user;
  };
}

export function withTenant(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Tenant ID required' },
      { status: 400 }
    );
  }

  return tenantId;
}