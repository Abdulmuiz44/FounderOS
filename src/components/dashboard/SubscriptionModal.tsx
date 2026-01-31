'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { X, Check, Shield, CreditCard, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SubscriptionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (isOpen) {
            loadSubscription();
        }
    }, [isOpen]);

    const loadSubscription = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Fetch latest subscription status
            const { data } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .in('status', ['active', 'on_trial', 'past_due', 'paused'])
                .order('created_at', { ascending: false })
                .maybeSingle();
            setSubscription(data);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

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
                        <Shield className="w-5 h-5" /> Subscription
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
                    ) : subscription ? (
                        <div className="space-y-4">
                            <div className="bg-[var(--background)] p-4 rounded-lg border border-[var(--border)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Shield className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-xl">{subscription.plan_name || 'Standard Plan'}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${subscription.status === 'active' ? 'border-green-500/30 text-green-500' : 'border-yellow-500/30 text-yellow-500'
                                                    }`}>
                                                    {subscription.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                                        {subscription.renews_at && (
                                            <p className="text-sm text-[var(--muted)]">
                                                {subscription.status === 'active' ? 'Next billing date:' : 'Plan expires on:'} <span className="font-mono text-[var(--foreground)]">{new Date(subscription.renews_at).toLocaleDateString()}</span>
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
                                        Manage Subscription
                                    </Button>
                                ) : (
                                    <p className="text-xs text-center text-[var(--muted)]">
                                        Use Lemon Squeezy email receipt to manage your subscription.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 py-6">
                            <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
                                <Shield className="w-8 h-8 text-[var(--muted)]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">Free Plan</h3>
                                <p className="text-[var(--muted)] text-sm px-8">You are currently on the free tier with limited access to features.</p>
                            </div>
                            <Button onClick={() => window.location.href = '/pricing'} className="w-full h-11 mt-2">
                                Upgrade to Pro
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
