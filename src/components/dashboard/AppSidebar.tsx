'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { createClient } from '@/utils/supabase/client';
import {
    Layout,
    Lightbulb,
    Settings,
    LogOut,
    Hammer,
    GitCommit,
    Target,
    Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal';
import { useState, useEffect } from 'react';

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [showSubscription, setShowSubscription] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch subscription on mount
    useEffect(() => {
        async function fetchSubscription() {
            try {
                const res = await fetch('/api/subscription');
                if (res.ok) {
                    const data = await res.json();
                    setSubscription(data);
                }
            } catch (error) {
                console.error('Error fetching subscription:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSubscription();
    }, []);

    const navItems = [
        {
            label: 'Overview',
            href: '/dashboard',
            icon: Layout,
            match: (path: string) => path === '/dashboard'
        },
        {
            label: 'Idea Lab',
            href: '/dashboard/opportunities',
            icon: Lightbulb,
            match: (path: string) => path.startsWith('/dashboard/opportunities')
        },
        {
            label: 'Execution',
            href: '/dashboard/projects',
            icon: Hammer, // or GitCommit
            match: (path: string) => path.startsWith('/dashboard/projects')
        }
    ];

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <>
            <aside className="w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col hidden md:flex sticky top-0 h-screen">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                            <img src="/logo.svg" alt="FounderOS Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold tracking-tight">FounderOS</span>
                    </div>
                    <ThemeToggle />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Workflow</h3>
                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors",
                                        item.match(pathname)
                                            ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                                            : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/50"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[var(--border)] space-y-2">
                    <button onClick={() => setShowSubscription(true)} className="flex items-center justify-between gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] w-full text-left px-3 py-2 rounded hover:bg-[var(--background)]/50 transition-colors">
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span>Subscription</span>
                        </div>
                        {!loading && subscription && (
                            <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded-full",
                                subscription.plan_name?.toLowerCase() === 'pro'
                                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                                    : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                            )}>
                                {subscription.plan_name || 'Free'}
                            </span>
                        )}
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] w-full text-left px-3 py-2 rounded hover:bg-[var(--background)]/50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
            <SubscriptionModal isOpen={showSubscription} onClose={() => setShowSubscription(false)} />
        </>
    );
}
