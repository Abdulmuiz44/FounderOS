'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Loader2, Info, Lightbulb, GitCommit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();

  // Check if user already has an active subscription
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        setUser(currentUser); // Store user for header display

        if (currentUser?.id) {
          try {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('status')
              .eq('user_id', currentUser.id)
              .in('status', ['active', 'on_trial'])
              .maybeSingle();

            if (sub) {
              router.push('/dashboard');
              return;
            }
          } catch (supabaseError) {
            console.warn('Supabase client failed to initialize or fetch:', supabaseError);
          }
        }
      } catch (e) {
        console.error('Error checking subscription:', e);
      } finally {
        setCheckingSubscription(false);
      }
    };
    checkSubscription();
  }, [router]);

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
      name: "Validator",
      id: "starter",
      price: "12",
      description: "Stop guessing. Validate your ideas before you build.",
      icon: Lightbulb,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_STARTER,
      features: [
        "Unlimited Idea Generation",
        "Basic Market Validation Reports",
        "Competitor Analysis",
        "5 Active Projects",
        "Community Access"
      ],
      cta: "Start Validator Trial",
      trialNote: "7 days free, then $12/mo",
    },
    {
      name: "Builder",
      id: "pro",
      price: "29",
      description: "For founders ready to execute and ship at speed.",
      popular: true,
      icon: GitCommit,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_PRO,
      features: [
        "Everything in Validator",
        "Deep Market Intelligence",
        "GitHub Activity Tracking",
        "Velocity & Streak Analytics",
        "Unlimited Projects",
        "Priority Support"
      ],
      cta: "Start Builder Trial",
      trialNote: "7 days free, then $29/mo",
    }
  ];

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--foreground)] selection:text-[var(--background)]">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-6xl mx-auto w-full z-50 bg-[var(--background)]/80 backdrop-blur-md">
        <Link href="/" className="font-bold text-lg tracking-tight">FounderOS</Link>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--card)] border border-[var(--border)]">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">Log In</Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Invest in clarity.</h1>
          <p className="text-[var(--muted)] text-xl leading-relaxed">
            The cost of building the wrong thing is months of your life. <br className="hidden md:block" />
            The cost of validating it first is less than a lunch.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-[var(--card)] border rounded-3xl p-8 shadow-xl flex flex-col relative overflow-hidden group ${plan.popular ? 'border-violet-500/50 ring-2 ring-violet-500/10' : 'border-[var(--border)]'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500"></div>
              )}

              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${plan.popular ? 'bg-violet-500/10 text-violet-500' : 'bg-[var(--foreground)]/5 text-[var(--foreground)]'}`}>
                    <plan.icon className="w-6 h-6" />
                  </div>
                  {plan.popular && <span className="bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>}
                </div>

                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-sm text-[var(--muted)] h-10">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-[var(--muted)]">/mo</span>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-8 mb-8 flex-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-4">WHAT'S INCLUDED</p>
                <ul className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-green-500/20 text-green-600' : 'bg-[var(--muted)]/20 text-[var(--muted)]'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full h-12 text-base rounded-xl transition-all ${plan.popular ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-violet-500/25' : ''}`}
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
              <p className="text-xs text-center text-[var(--muted)] mt-4 flex items-center justify-center gap-1">
                <Info className="w-3 h-3" /> {plan.trialNote}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 mt-16 pb-10">
          <div className="flex items-center gap-6 text-xs text-[var(--muted)] opacity-60">
            <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> SSL Encrypted Payment</span>
            <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> Instant Access</span>
          </div>
          <p className="text-xs text-[var(--muted)] opacity-50 text-center max-w-md">
            All plans come with a 7-day free trial. You won't be charged until the trial ends.
          </p>
        </div>
      </div>
    </div>
  );
}