'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface SubscriptionData {
  tenant: {
    id: string;
    name: string;
    isActive: boolean;
    subscriptionStatus: string;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
  };
  subscription: any;
  pricing: {
    currentPriceInCents: number;
    totalUsers: number;
    nonAdminUsers: number;
  };
  daysUntilDue: number | null;
}

export function useSubscription() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/subscription');
      setSubscriptionData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading subscription:', err);
      setError(err.response?.data?.error || 'Erro ao carregar assinatura');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const shouldShowNotification = () => {
    if (!subscriptionData) return false;
    const days = subscriptionData.daysUntilDue;
    return days !== null && days >= 0 && days <= 3;
  };

  const requiresPayment = () => {
    if (!subscriptionData) return false;
    return !subscriptionData.tenant.isActive;
  };

  return {
    subscriptionData,
    isLoading,
    error,
    shouldShowNotification: shouldShowNotification(),
    requiresPayment: requiresPayment(),
    reload: loadSubscription,
  };
}
