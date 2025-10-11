'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DotGrid } from '@/components/DotGrid';
import { getSessionToken } from '@/lib/supabase/utils';

type SubscriptionTier = 'basic' | 'pro' | 'enterprise';

interface PricingTier {
  id: SubscriptionTier;
  name: string;
  price: number;
  description: string;
  features: string[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 10,
    description: 'Essential service discovery for small teams',
    features: [
      'Up to 10 services',
      'Basic metrics',
      'API access',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    description: 'Advanced features for growing teams',
    features: [
      'Up to 50 services',
      'Advanced metrics & analytics',
      'Real-time monitoring',
      'Priority support',
      'Custom integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    description: 'Complete solution for large organizations',
    features: [
      'Unlimited services',
      'Advanced analytics & insights',
      'Custom SLA',
      'Dedicated support',
      'On-premise deployment',
      'Custom features',
    ],
  },
];

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubscribe = async (tier: SubscriptionTier) => {
    setError(null);
    setLoadingTier(tier);

    try {
      // Get auth token
      const token = await getSessionToken();

      if (!token) {
        // Redirect to login if not authenticated
        router.push(`/login?redirect=/pricing`);
        return;
      }

      // Call checkout API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      const response = await fetch(`${apiUrl}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const data = await response.json() as { url: string };

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <DotGrid />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 border border-gray-500" />
                  <div className="absolute inset-1 border border-gray-500" />
                </div>
                <span className="font-mono text-xl font-bold uppercase tracking-tight text-white">
                  Lattice
                </span>
              </Link>

              <div className="flex gap-4">
                <Link href="/login">
                  <Button variant="ghost" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-16">
          {/* Page Header */}
          <div className="mb-16 text-center">
            <h1 className="mb-4 text-5xl font-bold uppercase tracking-tight text-white">
              Pricing
            </h1>
            <p className="mx-auto max-w-2xl font-mono text-sm text-gray-500">
              Choose the perfect plan for your team. All plans include a 14-day free trial.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-auto mb-8 max-w-4xl border border-red-900 bg-red-950/20 p-4">
              <p className="font-mono text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="flex flex-col border border-gray-800 bg-black/50 backdrop-blur-sm transition-colors hover:border-gray-700"
              >
                {/* Card Header */}
                <div className="border-b border-gray-800 p-8">
                  <h3 className="mb-2 font-mono text-sm uppercase tracking-wider text-gray-500">
                    {tier.name}
                  </h3>
                  <div className="mb-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">
                      ${tier.price}
                    </span>
                    <span className="font-mono text-sm text-gray-500">/year</span>
                  </div>
                  <p className="font-mono text-xs text-gray-500">
                    {tier.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="flex flex-1 flex-col p-8">
                  <ul className="mb-8 space-y-3">
                    {tier.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 font-mono text-sm text-gray-400"
                      >
                        <span className="mt-1 text-white">→</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="primary"
                    size="lg"
                    className="mt-auto w-full"
                    onClick={() => void handleSubscribe(tier.id)}
                    isLoading={loadingTier === tier.id}
                    disabled={loadingTier !== null}
                  >
                    {loadingTier === tier.id ? 'Processing...' : 'Subscribe'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <p className="font-mono text-xs text-gray-600">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <p className="mt-2 font-mono text-xs text-gray-600">
              Need a custom plan?{' '}
              <a href="mailto:sales@lattice.dev" className="text-white hover:text-gray-300">
                Contact us
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
