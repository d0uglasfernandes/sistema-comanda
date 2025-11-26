import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateTokens } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/cookies';
import { checkTenantAccess } from '@/lib/subscription-helpers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verifica o status da assinatura do tenant
    const subscriptionAccess = await checkTenantAccess(user.tenantId);

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
      },
      subscription: {
        isActive: subscriptionAccess.isActive,
        requiresPayment: subscriptionAccess.requiresPayment,
        status: subscriptionAccess.subscriptionStatus,
        daysUntilDue: subscriptionAccess.daysUntilDue,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}