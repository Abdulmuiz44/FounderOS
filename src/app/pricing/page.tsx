'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: "Builder",
      price: "9",
      features: [
        "Unlimited Projects",
        "AI Workspace Tools",
        "Momentum Tracking",
        "Community Access"
      ],
      link: "https://store.lemonsqueezy.com/checkout/buy/..." // Replace with actual link
    },
    {
      name: "Pro",
      price: "29",
      features: [
        "Everything in Builder",
        "Priority AI Access",
        "Advanced Analytics",
        "1-on-1 Strategy Call"
      ],
      link: "https://store.lemonsqueezy.com/checkout/buy/..."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-5xl mx-auto w-full z-50">
        <Link href="/" className="font-bold text-lg tracking-tight">FounderOS</Link>
        <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
          Log In
        </Link>
      </nav>

      <div className="text-center mb-16 mt-20">
        <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
        <p className="text-[var(--muted)]">Invest in your shipping velocity.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {plans.map((plan, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-xl flex flex-col"
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <div className="flex justify-center items-baseline gap-1">
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

            <a 
              href={plan.link}
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full h-12 text-base">
                Subscribe
              </Button>
            </a>
          </motion.div>
        ))}
      </div>
      
      <p className="text-xs text-center text-[var(--muted)] mt-12 opacity-60">
        Secure payment via LemonSqueezy. Cancel anytime from your dashboard.
      </p>
    </div>
  );
}