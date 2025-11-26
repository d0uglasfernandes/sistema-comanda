import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { updateSubscriptionPrice, calculateSubscriptionPrice } from '@/lib/stripe';

/**
 * POST /api/subscription/update-price
 * Atualiza o preço da assinatura baseado no número de usuários
 */
export async function POST(request: NextRequest) {
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
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (!tenant.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Conta usuários totais
    const totalUsers = await db.user.count({
      where: { tenantId: user.tenantId },
    });

    // Calcula novo preço
    const newPriceInCents = calculateSubscriptionPrice(totalUsers);

    // Atualiza no Stripe
    const subscription = await updateSubscriptionPrice(
      tenant.stripeSubscriptionId,
      newPriceInCents
    );

    // Atualiza no banco
    await db.subscription.updateMany({
      where: { stripeSubscriptionId: tenant.stripeSubscriptionId },
      data: {
        priceInCents: newPriceInCents,
        userCount: totalUsers,
      },
    });

    return NextResponse.json({
      success: true,
      newPriceInCents,
      userCount: totalUsers,
      subscription: {
        id: subscription.id,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('Update subscription price error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
