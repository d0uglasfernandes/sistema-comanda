import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRefreshToken, generateTokens } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/cookies';

export async function POST(request: NextRequest) {
  try {
    let refreshToken;
    
    // Tenta pegar do corpo da requisição primeiro
    const clonedRequest = request.clone();
    try {
      const body = await clonedRequest.json();
      refreshToken = body.refreshToken;
    } catch (error) {
      // Se não conseguir fazer parsing do JSON, tenta pegar dos cookies
      const cookies = await request.cookies;
      refreshToken = cookies.get('refresh_token')?.value;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    await setAuthCookies(tokens);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        theme: user.theme,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}