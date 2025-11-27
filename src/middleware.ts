import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all methods for auth endpoints, setup, tenant, webhooks and payment pages
  if (
    pathname === '/' ||
    pathname.startsWith('/api/auth/') || 
    pathname.startsWith('/api/setup') || 
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/api/subscription/create-checkout') ||
    pathname === '/api/tenant' || 
    pathname === '/login' || 
    pathname === '/register' ||
    pathname === '/payment-required' ||
    pathname === '/payment-success'
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Simple JWT validation without crypto (edge compatible)
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
      
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-tenant-id', payload.tenantId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  }

  // Protect all pages except landing page, login and register
  if (pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Simple JWT validation without crypto (edge compatible)
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
      
      return NextResponse.next();
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};