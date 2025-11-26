import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { stripe, calculateSubscriptionPrice } from '@/lib/stripe';

/**
 * GET /api/subscription
 * Retorna o status da assinatura do tenant
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tenant = await db.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        users: {
          where: {
            role: {
              not: 'ADMIN',
            },
          },
        },
        subscriptions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Conta usuários não-admin para calcular o preço
    const nonAdminUserCount = tenant.users.length;
    const totalUsers = await db.user.count({
      where: { tenantId: user.tenantId },
    });
    
    const currentPrice = calculateSubscriptionPrice(nonAdminUserCount + 1); // +1 para incluir o admin

    // Calcula dias restantes
    let daysUntilDue = null;
    if (tenant.currentPeriodEnd) {
      const now = new Date();
      const periodEnd = new Date(tenant.currentPeriodEnd);
      daysUntilDue = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (tenant.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(tenant.trialEndsAt);
      daysUntilDue = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        isActive: tenant.isActive,
        subscriptionStatus: tenant.subscriptionStatus,
        currentPeriodEnd: tenant.currentPeriodEnd,
        trialEndsAt: tenant.trialEndsAt,
      },
      subscription: tenant.subscriptions[0] || null,
      pricing: {
        currentPriceInCents: currentPrice,
        totalUsers,
        nonAdminUsers: nonAdminUserCount,
      },
      daysUntilDue,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
