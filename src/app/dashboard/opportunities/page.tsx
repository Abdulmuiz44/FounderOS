'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Opportunity } from '@/modules/opportunity-intelligence/types';

export default function OpportunitiesDashboard() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/opportunities')
            .then(res => res.json())
            .then(data => {
                if (data.opportunities) setOpportunities(data.opportunities);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">Opportunity Intelligence</h1>
                    <p className="text-[var(--muted)] mt-1 text-lg">Discover, Validate, and Execute your next big idea.</p>
                </div>
                <Link
                    href="/dashboard/opportunities/create"
                    className="bg-[var(--accent)] text-[var(--accent-foreground)] px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Opportunity
                </Link>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-[var(--muted)]" /></div>
            ) : opportunities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]/50">
                    <div className="w-16 h-16 bg-[var(--background)] rounded-full flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                        <Plus className="w-8 h-8 text-[var(--muted)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">No opportunities yet</h3>
                    <p className="text-[var(--muted)] max-w-md mb-8 leading-relaxed">
                        Start your journey by generating AI-powered startup ideas tailored to your unique profile and skills.
                    </p>
                    <Link
                        href="/dashboard/opportunities/create"
                        className="text-[var(--accent)] font-semibold hover:underline flex items-center gap-2"
                    >
                        Launch Generator <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                        <Link key={opp.id} href={`/dashboard/opportunities/${opp.id}`} className="group h-full">
                            <div className="h-full flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--foreground)]/20 hover:shadow-md transition-all relative overflow-hidden">
                                {/* Status Badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${opp.status === 'VALIDATED' ? 'bg-[var(--success-bg)] text-[var(--success-text)]' :
                                            opp.status === 'CONVERTED' ? 'bg-purple-500/10 text-purple-500' :
                                                'bg-[var(--background)] border border-[var(--border)] text-[var(--muted)]'
                                        }`}>
                                        {opp.status}
                                    </span>
                                    <div className="p-2 -mr-2 -mt-2 rounded-full text-[var(--muted)] group-hover:text-[var(--foreground)] group-hover:bg-[var(--background)] transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-[var(--foreground)] mb-3 line-clamp-2 leading-tight">
                                    {opp.title}
                                </h3>
                                <p className="text-[var(--muted)] text-sm line-clamp-3 mb-6 flex-1">
                                    {opp.problem_statement}
                                </p>

                                {/* Footer */}
                                <div className="pt-4 border-t border-[var(--border)] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    <span className="text-xs font-mono text-[var(--muted)] truncate">Target: {opp.target_niche}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
