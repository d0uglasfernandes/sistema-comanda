import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateTokens } from '@/lib/jwt';
import { setAuthCookies } from '@/lib/cookies';

function generateTenantId(): string {
  return 'tenant_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName } = await request.json();

    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const tenantId = generateTenantId();

    // Calcula a data de término do período de teste (3 dias)
    const trialDays = parseInt(process.env.TRIAL_DAYS || '3');
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    const tenant = await db.tenant.create({
      data: {
        id: tenantId,
        name: companyName,
        ownerEmail: email,
        isActive: true, // Ativo durante o período de teste
        trialEndsAt,
        subscriptionStatus: 'TRIAL',
      },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN',
        tenantId,
      },
    });

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
      tenantId,
      companyName,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}