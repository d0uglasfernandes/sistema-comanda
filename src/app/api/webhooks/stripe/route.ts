import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * Webhook do Stripe para processar eventos de pagamento
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verifica a assinatura do webhook
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Em desenvolvimento, pode não ter o webhook secret configurado
      event = JSON.parse(body);
      console.warn('⚠️ Webhook secret not configured, skipping signature verification');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log('🔔 Stripe webhook event:', event.type);

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📝 Subscription created:', subscription.id);

  const tenantId = subscription.metadata.tenantId;
  if (!tenantId) {
    console.error('No tenantId in subscription metadata');
    return;
  }

  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    console.error('Tenant not found:', tenantId);
    return;
  }

  // Atualiza o tenant com informações da assinatura
  await db.tenant.update({
    where: { id: tenantId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status === 'trialing' ? 'TRIAL' : 'ACTIVE',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      isActive: true,
    },
  });

  // Cria registro de assinatura
  const userCount = await db.user.count({
    where: { tenantId },
  });

  await db.subscription.create({
    data: {
      tenantId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status === 'trialing' ? 'TRIAL' : 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceInCents: subscription.items.data[0]?.price.unit_amount || 0,
      userCount,
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  const tenant = await db.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!tenant) {
    console.error('Tenant not found for subscription:', subscription.id);
    return;
  }

  // Mapeia o status do Stripe para o status do sistema
  let subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' = 'ACTIVE';
  let isActive = false;

  switch (subscription.status) {
    case 'trialing':
      subscriptionStatus = 'TRIAL';
      isActive = true;
      break;
    case 'active':
      subscriptionStatus = 'ACTIVE';
      isActive = true;
      break;
    case 'past_due':
      subscriptionStatus = 'PAST_DUE';
      isActive = false;
      break;
    case 'canceled':
      subscriptionStatus = 'CANCELED';
      isActive = false;
      break;
    case 'unpaid':
      subscriptionStatus = 'UNPAID';
      isActive = false;
      break;
  }

  // Atualiza o tenant
  await db.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus,
      isActive,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  // Atualiza o registro de assinatura
  const userCount = await db.user.count({
    where: { tenantId: tenant.id },
  });

  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscriptionStatus,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      priceInCents: subscription.items.data[0]?.price.unit_amount || 0,
      userCount,
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id);

  const tenant = await db.tenant.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!tenant) {
    console.error('Tenant not found for subscription:', subscription.id);
    return;
  }

  // Bloqueia o tenant
  await db.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: 'CANCELED',
      isActive: false,
    },
  });

  // Atualiza o registro de assinatura
  await db.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
    },
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('✅ Payment succeeded:', invoice.id);

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    console.error('No subscription ID in invoice');
    return;
  }

  const tenant = await db.tenant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!tenant) {
    console.error('Tenant not found for subscription:', subscriptionId);
    return;
  }

  // Desbloqueia o tenant
  await db.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });

  // Cria registro de pagamento
  await db.payment.create({
    data: {
      tenantId: tenant.id,
      stripeInvoiceId: invoice.id,
      stripePaymentIntent: invoice.payment_intent as string || null,
      amount: invoice.amount_paid,
      status: 'SUCCEEDED',
      paidAt: new Date(),
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Payment failed:', invoice.id);

  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) {
    console.error('No subscription ID in invoice');
    return;
  }

  const tenant = await db.tenant.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!tenant) {
    console.error('Tenant not found for subscription:', subscriptionId);
    return;
  }

  // Bloqueia o tenant
  await db.tenant.update({
    where: { id: tenant.id },
    data: {
      subscriptionStatus: 'PAST_DUE',
      isActive: false,
    },
  });

  // Cria registro de pagamento falhado
  await db.payment.create({
    data: {
      tenantId: tenant.id,
      stripeInvoiceId: invoice.id,
      stripePaymentIntent: invoice.payment_intent as string || null,
      amount: invoice.amount_due,
      status: 'FAILED',
      failedAt: new Date(),
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('🎉 Checkout completed:', session.id);

  const tenantId = session.metadata?.tenantId;
  if (!tenantId) {
    console.error('No tenantId in session metadata');
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error('No subscription ID in checkout session');
    return;
  }

  // Atualiza o tenant com o ID da assinatura
  await db.tenant.update({
    where: { id: tenantId },
    data: {
      stripeSubscriptionId: subscriptionId,
    },
  });
}

// Desabilita o body parser do Next.js para este endpoint
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
