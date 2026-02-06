'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { signOut } from 'next-auth/react';
import {
    Layout,
    Lightbulb,
    Settings,
    LogOut,
    Hammer,
    GitCommit,
    Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubscriptionModal } from '@/components/dashboard/SubscriptionModal';
import { useState } from 'react';

export function AppSidebar() {
    const pathname = usePathname();
    const [showSubscription, setShowSubscription] = useState(false);

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
        await signOut({ callbackUrl: '/' });
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
                    <button onClick={() => setShowSubscription(true)} className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] w-full text-left px-3 py-2 rounded hover:bg-[var(--background)]/50 transition-colors">
                        <Settings className="w-4 h-4" />
                        <span>Subscription</span>
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
