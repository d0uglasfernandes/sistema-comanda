import { db } from './db';

/**
 * Verifica se o tenant está ativo e pode acessar o sistema
 */
export async function checkTenantAccess(tenantId: string): Promise<{
  isActive: boolean;
  requiresPayment: boolean;
  subscriptionStatus: string;
  daysUntilDue: number | null;
}> {
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    return {
      isActive: false,
      requiresPayment: true,
      subscriptionStatus: 'NOT_FOUND',
      daysUntilDue: null,
    };
  }

  // Calcula dias até o vencimento
  let daysUntilDue: number | null = null;
  const now = new Date();

  if (tenant.currentPeriodEnd) {
    const periodEnd = new Date(tenant.currentPeriodEnd);
    daysUntilDue = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  } else if (tenant.trialEndsAt) {
    const trialEnd = new Date(tenant.trialEndsAt);
    daysUntilDue = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Se o trial expirou e não tem assinatura, bloqueia
    if (daysUntilDue < 0 && !tenant.stripeSubscriptionId) {
      await db.tenant.update({
        where: { id: tenantId },
        data: {
          isActive: false,
          subscriptionStatus: 'UNPAID',
        },
      });
      
      return {
        isActive: false,
        requiresPayment: true,
        subscriptionStatus: 'TRIAL_EXPIRED',
        daysUntilDue,
      };
    }
  }

  return {
    isActive: tenant.isActive,
    requiresPayment: !tenant.isActive,
    subscriptionStatus: tenant.subscriptionStatus,
    daysUntilDue,
  };
}

/**
 * Verifica se deve mostrar notificação de vencimento (3 dias antes)
 */
export function shouldShowPaymentNotification(daysUntilDue: number | null): boolean {
  if (daysUntilDue === null) return false;
  return daysUntilDue <= 3 && daysUntilDue >= 0;
}
