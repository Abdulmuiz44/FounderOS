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
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Opportunity Intelligence</h1>
                    <p className="text-slate-500 mt-1">Discover, Validate, and Execute your next big idea.</p>
                </div>
                <Link
                    href="/dashboard/opportunities/create"
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
                >
                    <Plus className="w-4 h-4" />
                    New Opportunity
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
            ) : opportunities.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                    <h3 className="text-lg font-medium text-slate-900">No opportunities yet</h3>
                    <p className="text-slate-500 mb-4">Start by generating ideas based on your profile.</p>
                    <Link
                        href="/dashboard/opportunities/create"
                        className="text-indigo-600 font-medium hover:underline"
                    >
                        Launch Generator &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                        <Link key={opp.id} href={`/dashboard/opportunities/${opp.id}`}>
                            <div className="block bg-white border border-slate-200 rounded-xl p-6 hover:border-indigo-500 hover:shadow-lg transition cursor-pointer group h-full relative">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${opp.status === 'VALIDATED' ? 'bg-green-100 text-green-700' :
                                            opp.status === 'CONVERTED' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {opp.status}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition" />
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{opp.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-3">{opp.problem_statement}</p>

                                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400">
                                    Target: {opp.target_niche}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
