import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-utils';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { theme } = await request.json();

    if (!theme || !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be "light" or "dark"' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: user.userId },
      data: { theme },
    });

    return NextResponse.json({
      theme: updatedUser.theme,
    });
  } catch (error) {
    console.error('Update theme error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}