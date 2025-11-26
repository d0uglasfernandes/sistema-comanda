import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY não está definida no ambiente');
}

function getSafePeriodStart(current_period_end?: number): Date {
  if (typeof current_period_end === "number" && !isNaN(current_period_end)) {
    const date = new Date(current_period_end * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Se cair aqui → data ausente ou inválida
  const now = new Date();
  now.setDate(now.getDate());
  return now;
}

function getSafePeriodEnd(current_period_end?: number): Date {
  if (typeof current_period_end === "number" && !isNaN(current_period_end)) {
    const date = new Date(current_period_end * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Se cair aqui → data ausente ou inválida
  const now = new Date();
  now.setDate(now.getDate() + 30);
  return now;
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

/**
 * Calcula o preço da assinatura baseado no número de usuários
 * Fórmula: R$100 fixo + R$10 por usuário adicional (excluindo admins)
 */
export function calculateSubscriptionPrice(userCount: number): number {
  const basePriceCents = parseInt(process.env.BASE_PRICE_CENTS || '10000'); // R$100
  const pricePerUserCents = parseInt(process.env.PRICE_PER_USER_CENTS || '1000'); // R$10
  
  // Remove o primeiro usuário (dono) do cálculo
  const additionalUsers = Math.max(0, userCount - 1);
  
  return basePriceCents + (additionalUsers * pricePerUserCents);
}

/**
 * Cria um customer no Stripe
 */
export async function createStripeCustomer(tenantId: string, tenantName: string, ownerEmail: string) {
  const customer = await stripe.customers.create({
    name: tenantName,
    email: ownerEmail,
    metadata: {
      tenantId,
    },
  });
  
  return customer;
}

/**
 * Cria uma assinatura com período de teste
 */
export async function createSubscription(
  customerId: string,
  priceInCents: number,
  trialDays: number = 3
) {
  // Cria um price no Stripe
  const price = await stripe.prices.create({
    unit_amount: priceInCents,
    currency: 'brl',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    product_data: {
      name: 'Assinatura Sistema Comanda',
      // description: 'Acesso ao sistema de gestão de comandas',
    },
  });

  // Cria a assinatura com período de teste
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: price.id }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  return subscription;
}

/**
 * Atualiza o preço da assinatura baseado no número de usuários
 */
export async function updateSubscriptionPrice(
  subscriptionId: string,
  newPriceInCents: number
) {
  // Busca a assinatura atual
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  if (!subscription.items.data[0]) {
    throw new Error('Subscription item not found');
  }

  // Cria um novo price
  const newPrice = await stripe.prices.create({
    unit_amount: newPriceInCents,
    currency: 'brl',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    product_data: {
      name: 'Assinatura Sistema Comanda',
      // description: 'Acesso ao sistema de gestão de comandas',
    },
  });

  // Atualiza a assinatura com o novo preço
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPrice.id,
      },
    ],
    proration_behavior: 'always_invoice',
  });

  return updatedSubscription;
}

/**
 * Cancela uma assinatura
 */
export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}

/**
 * Retoma uma assinatura cancelada
 */
export async function resumeSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  return subscription;
}

/**
 * Cria uma sessão de checkout do Stripe
 */
export async function createCheckoutSession(
  customerId: string,
  priceInCents: number,
  tenantId: string,
  successUrl: string,
  cancelUrl: string,
  includeTrial: boolean = true
) {
  // Cria um price
  const price = await stripe.prices.create({
    unit_amount: priceInCents,
    currency: 'brl',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    product_data: {
      name: 'Assinatura Sistema Comanda',
      // description: 'Acesso ao sistema de gestão de comandas',
    },
  });

  const subscriptionData: any = {
    metadata: {
      tenantId,
    },
  };

  // Só adiciona trial se includeTrial for true
  if (includeTrial) {
    subscriptionData.trial_period_days = parseInt(process.env.TRIAL_DAYS || '3');
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: subscriptionData,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      tenantId,
    },
  });

  return session;
}

/**
 * Verifica o status de uma assinatura
 */
export async function getSubscriptionStatus(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return {
    status: subscription.status,
    currentPeriodEnd: getSafePeriodEnd(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}
