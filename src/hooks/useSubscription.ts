import { useState, useEffect, useCallback } from 'react';
import type { SubscriptionStatus, SubscriptionPlan } from '../lib/subscription';

export interface SubscriptionState {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useSubscription(userId: string | null) {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    status: 'free',
    plan: 'free',
    isPro: false,
    isLoading: false,
    error: null,
  });

  const fetchSubscription = useCallback(async () => {
    if (!userId) return;

    setSubscription(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/subscription?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription');
      
      const data = await response.json();
      setSubscription({
        status: data.subscriptionStatus,
        plan: data.subscriptionPlan,
        isPro: data.isPro,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setSubscription(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const refreshSubscription = useCallback(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    ...subscription,
    refreshSubscription,
  };
}

/**
 * Simple hook to check if user can access pro features
 */
export function useProAccess(userId: string | null) {
  const { isPro, isLoading, error } = useSubscription(userId);
  
  return {
    canAccess: isPro,
    isLoading,
    error,
  };
}
