'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Check if user already has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      const res = await fetch('/api/auth/session');
      const session = await res.json();

      if (session?.user?.id) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', session.user.id)
          .in('status', ['active', 'on_trial'])
          .maybeSingle();

        if (sub) {
          // User already has subscription, go to dashboard
          router.push('/dashboard');
          return;
        }
      }
      setCheckingSubscription(false);
    };
    checkSubscription();
  }, [router, supabase]);

  const handleCheckout = async (variantId: string, planName: string) => {
    try {
      setLoading(planName);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert('Failed to start checkout. Please try again.');
        setLoading(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred. Please try again.');
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Starter",
      id: "starter",
      price: "12",
      description: "For solo builders just starting.",
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_STARTER,
      features: [
        "Up to 3 Active Projects",
        "Unlimited Builder Logs",
        "Basic Pattern Detection",
        "Timeline History"
      ],
      cta: "Start 7-Day Free Trial",
      trialNote: "No charge for 7 days",
    },
    {
      name: "Pro",
      id: "pro",
      price: "29",
      description: "For serious builders shipping daily.",
      popular: true,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_PRO,
      features: [
        "Unlimited Projects",
        "Advanced AI Insights",
        "System Drift Tracking",
        "Full OS Profile Analysis",
        "Data Export (CSV/JSON)"
      ],
      cta: "Start 7-Day Free Trial",
      trialNote: "No charge for 7 days",
    }
  ];

  // Show loading while checking subscription
  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-5xl mx-auto w-full z-50">
        <Link href="/" className="font-bold text-lg tracking-tight">FounderOS</Link>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium bg-[var(--card)] px-3 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]">
            Secure Checkout
          </span>
        </div>
      </nav>

      <div className="text-center mb-16 mt-20 max-w-lg">
        <h1 className="text-4xl font-bold mb-4">Invest in your system.</h1>
        <p className="text-[var(--muted)] text-lg">
          FounderOS is a paid tool because we are aligned with your success, not your data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-[var(--card)] border rounded-2xl p-8 shadow-xl flex flex-col relative ${plan.popular ? 'border-[var(--foreground)]' : 'border-[var(--border)]'}`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--foreground)] text-[var(--background)] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <p className="text-xs text-[var(--muted)] mb-6">{plan.description}</p>
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 mb-4">
                <span className="text-sm font-medium text-green-500">7 days free</span>
              </div>
              <div className="flex justify-center items-baseline gap-1">
                <span className="text-sm text-[var(--muted)]">then</span>
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-[var(--muted)]">/mo</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, j) => (
                <li key={j} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-[var(--foreground)]" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className={`w-full h-12 text-base ${plan.popular ? 'shadow-lg hover:shadow-xl' : ''}`}
              variant={plan.popular ? 'primary' : 'secondary'}
              onClick={() => {
                if (plan.variantId) {
                  handleCheckout(plan.variantId, plan.name);
                } else {
                  alert('Checkout not configured for this plan yet.');
                }
              }}
              disabled={loading === plan.name}
            >
              {loading === plan.name ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                plan.cta
              )}
            </Button>
            <p className="text-xs text-center text-[var(--muted)] mt-3">
              {plan.trialNote} • Cancel anytime
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 mt-12">
        <div className="flex items-center gap-6 text-xs text-[var(--muted)] opacity-60">
          <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Secure Payment</span>
          <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Instant Access</span>
        </div>
        <p className="text-xs text-[var(--muted)] opacity-50 text-center max-w-md">
          Try FounderOS free for 7 days. Your card won't be charged until the trial ends. Cancel anytime before to avoid charges.
        </p>
      </div>
    </div>
  );
}