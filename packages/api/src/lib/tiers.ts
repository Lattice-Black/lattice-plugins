/**
 * Subscription tier types
 */
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

/**
 * Tier limits configuration
 */
export interface TierLimits {
  maxServices: number;
  advancedMetrics: boolean;
  realTimeMonitoring: boolean;
  customIntegrations: boolean;
  advancedAnalytics: boolean;
  customSLA: boolean;
  onPremiseDeployment: boolean;
}

/**
 * Tier configuration mapping
 */
export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxServices: 3,
    advancedMetrics: false,
    realTimeMonitoring: false,
    customIntegrations: false,
    advancedAnalytics: false,
    customSLA: false,
    onPremiseDeployment: false,
  },
  basic: {
    maxServices: 10,
    advancedMetrics: false,
    realTimeMonitoring: false,
    customIntegrations: false,
    advancedAnalytics: false,
    customSLA: false,
    onPremiseDeployment: false,
  },
  pro: {
    maxServices: 50,
    advancedMetrics: true,
    realTimeMonitoring: true,
    customIntegrations: true,
    advancedAnalytics: true,
    customSLA: false,
    onPremiseDeployment: false,
  },
  enterprise: {
    maxServices: Infinity,
    advancedMetrics: true,
    realTimeMonitoring: true,
    customIntegrations: true,
    advancedAnalytics: true,
    customSLA: true,
    onPremiseDeployment: true,
  },
};

/**
 * Get limits for a specific tier
 */
export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if a tier allows a specific feature
 */
export function tierAllowsFeature(
  tier: SubscriptionTier,
  feature: keyof Omit<TierLimits, 'maxServices'>
): boolean {
  return TIER_LIMITS[tier][feature];
}

/**
 * Check if adding services would exceed tier limit
 */
export function canAddServices(
  tier: SubscriptionTier,
  currentServiceCount: number,
  servicesToAdd: number = 1
): boolean {
  const limits = TIER_LIMITS[tier];
  return currentServiceCount + servicesToAdd <= limits.maxServices;
}
