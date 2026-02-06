'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { X, Check, Shield, CreditCard, Loader2, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Use service role client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Use anon key for client-side
);

export function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadSubscription();
        }
    }, [isOpen]);

    const loadSubscription = async () => {
        setLoading(true);
        try {
            // Get session from Supabase
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.id) {
                // Fetch subscription via API to use service role
                const subRes = await fetch('/api/subscription');
                if (subRes.ok) {
                    const data = await subRes.json();
                    setSubscription(data);
                }
            }
        } catch (error) {
            console.error('Failed to load subscription:', error);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    const isPro = subscription?.plan_name?.toLowerCase() === 'pro';
    const isStarter = subscription?.plan_name?.toLowerCase() === 'starter';
    const isActive = subscription?.status === 'active' || subscription?.status === 'on_trial';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--card)] w-full max-w-md rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5" /> Subscription & Settings
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-[var(--background)] rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
                            <p className="text-sm text-[var(--muted)]">Loading subscription details...</p>
                        </div>
                    ) : subscription && isActive ? (
                        <div className="space-y-4">
                            {/* Pro Plan Card */}
                            <div className={`p-6 rounded-xl border relative overflow-hidden ${isPro
                                ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30'
                                : 'bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30'
                                }`}>
                                <div className="absolute top-0 right-0 p-2 opacity-20">
                                    {isPro ? <Crown className="w-24 h-24" /> : <Sparkles className="w-24 h-24" />}
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {isPro && <Crown className="w-5 h-5 text-purple-500" />}
                                                <h3 className="font-bold text-2xl">{subscription.plan_name || 'Standard'} Plan</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs uppercase font-bold px-2 py-1 rounded-full ${subscription.status === 'active'
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : 'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {subscription.status === 'on_trial' ? '🎉 Trial Active' : '✓ Active'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="space-y-2 mb-4">
                                        {isPro ? (
                                            <>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>Unlimited Projects</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>Advanced AI Insights</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>System Drift Tracking</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>Full OS Profile Analysis</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>Data Export (CSV/JSON)</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>Up to 3 Active Projects</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>Unlimited Builder Logs</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Check className="w-4 h-4 text-green-500" />
                                                    <span>Basic Pattern Detection</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border)]">
                                        {subscription.renews_at && (
                                            <p className="text-sm text-[var(--muted)]">
                                                {subscription.status === 'active' ? 'Renews:' : 'Trial ends:'}{' '}
                                                <span className="font-mono text-[var(--foreground)]">
                                                    {new Date(subscription.renews_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {subscription.update_payment_method_url ? (
                                    <Button
                                        onClick={() => window.open(subscription.update_payment_method_url, '_blank')}
                                        variant="secondary"
                                        className="w-full justify-center gap-2 h-11"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                        Manage Billing
                                    </Button>
                                ) : (
                                    <p className="text-xs text-center text-[var(--muted)]">
                                        Check your email for billing management options.
                                    </p>
                                )}

                                {!isPro && (
                                    <Button onClick={() => window.location.href = '/pricing'} className="w-full h-11">
                                        <Crown className="w-4 h-4 mr-2" />
                                        Upgrade to Pro
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 py-6">
                            <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
                                <Shield className="w-8 h-8 text-[var(--muted)]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">No Active Subscription</h3>
                                <p className="text-[var(--muted)] text-sm px-8">Start your 7-day free trial to unlock all features.</p>
                            </div>
                            <Button onClick={() => window.location.href = '/pricing'} className="w-full h-11 mt-2">
                                Start Free Trial
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
