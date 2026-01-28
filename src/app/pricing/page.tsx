'use client';

import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const features = [
    "Weekly AI Builder Verdicts",
    "Growth & Engineering Pattern Detection",
    "History & Momentum Tracking",
    "Private Builder Community",
    "Priority Support"
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-5xl mx-auto w-full z-50">
        <Link href="/" className="font-bold text-lg tracking-tight">FounderOS</Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
            Log In
          </Link>
        </div>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Builder Pro</h1>
          <p className="text-[var(--muted)]">Focus on shipping, we'll handle the signal.</p>
        </div>

        <div className="text-center mb-8">
          <span className="text-4xl font-bold">$9</span>
          <span className="text-[var(--muted)]">/month</span>
        </div>

        <ul className="space-y-4 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-[var(--foreground)]" />
              {feature}
            </li>
          ))}
        </ul>

        {/* Replace with actual LemonSqueezy Checkout Link */}
        <a 
          href="https://store.lemonsqueezy.com/checkout/buy/..." 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button className="w-full h-12 text-base">
            Subscribe & Start Building
          </Button>
        </a>

        <p className="text-xs text-center text-[var(--muted)] mt-4">
          Secure payment via LemonSqueezy. Cancel anytime.
        </p>
      </motion.div>
    </div>
  );
}
