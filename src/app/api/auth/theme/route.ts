import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/jwt';

export async function PATCH(request: NextRequest) {
  return handleThemeUpdate(request);
}

export async function POST(request: NextRequest) {
  return handleThemeUpdate(request);
}

async function handleThemeUpdate(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { theme } = await request.json();

    if (!theme || !['light', 'dark'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme' },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: user.userId },
      data: { theme },
    });

    return NextResponse.json({ theme: updatedUser.theme });
  } catch (error) {
    console.error('Theme update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}