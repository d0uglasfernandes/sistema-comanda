import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { createStripeCustomer, createCheckoutSession, calculateSubscriptionPrice } from '@/lib/stripe';

/**
 * POST /api/subscription/create-checkout
 * Cria uma sessão de checkout do Stripe
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

    // Verifica se o usuário é admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can manage subscriptions' },
        { status: 403 }
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
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Cria customer no Stripe se não existir
    let stripeCustomerId = tenant.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        tenant.id,
        tenant.name,
        tenant.ownerEmail || user.email
      );
      
      stripeCustomerId = customer.id;
      
      await db.tenant.update({
        where: { id: tenant.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Calcula o preço baseado no número de usuários não-admin
    const nonAdminUserCount = tenant.users.length;
    const totalUsers = await db.user.count({
      where: { tenantId: user.tenantId },
    });
    
    const priceInCents = calculateSubscriptionPrice(totalUsers);

    // URLs de sucesso e cancelamento
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const successUrl = `${baseUrl}/?payment=success`;
    const cancelUrl = `${baseUrl}/?payment=cancelled`;

    // Se o tenant já está em TRIAL ou PAST_DUE, não adiciona trial adicional
    // TRIAL: já está testando, não precisa de outro período de teste
    // PAST_DUE: empresa inadimplente renovando, já teve acesso antes
    // Apenas empresas completamente novas recebem trial de 3 dias
    const includeTrial = tenant.subscriptionStatus !== 'TRIAL' && tenant.subscriptionStatus !== 'PAST_DUE' && tenant.subscriptionStatus !== 'CANCELED' && tenant.subscriptionStatus !== 'UNPAID';

    // Cria sessão de checkout
    const session = await createCheckoutSession(
      stripeCustomerId,
      priceInCents,
      tenant.id,
      successUrl,
      cancelUrl,
      includeTrial
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
