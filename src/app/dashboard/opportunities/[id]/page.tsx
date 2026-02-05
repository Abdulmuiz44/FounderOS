'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, BarChart3, ChevronRight, Play } from 'lucide-react';
import { Opportunity, OpportunityScore, ExecutionPlan, MonetizationMap } from '@/modules/opportunity-intelligence/types';

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [opportunity, setOpportunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        fetch(`/api/opportunities/${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) setOpportunity(data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleRunValidation = async () => {
        setValidating(true);
        try {
            const res = await fetch('/api/opportunities/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunityId: id })
            });
            const data = await res.json();

            // Refresh local data
            // For simplicity, just reload or merge
            // We'll merge mock response or fetch again
            if (data.scores) {
                setOpportunity((prev: any) => ({
                    ...prev,
                    opportunity_scores: data.scores,
                    monetization_maps: data.monetization,
                    execution_plans: data.plan,
                    status: 'VALIDATED'
                }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setValidating(false);
        }
    };

    const handleConvert = async () => {
        // Call convert API
        const res = await fetch(`/api/opportunities/${id}/convert`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            router.push(data.redirectUrl);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (!opportunity) return <div className="p-12 text-center">Opportunity not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* Header */}
            <div className="mb-8 border-b border-slate-200 pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{opportunity.title}</h1>
                        <p className="text-lg text-slate-600 mt-2">{opportunity.problem_statement}</p>
                    </div>
                    <div className="flex gap-3">
                        {!opportunity.opportunity_scores ? (
                            <button
                                onClick={handleRunValidation}
                                disabled={validating}
                                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                                {validating ? <Loader2 className="animate-spin w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                                Run Validation AI
                            </button>
                        ) : (
                            <button
                                onClick={handleConvert}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                            >
                                <Play className="w-4 h-4" />
                                Start Project
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Context */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-4">Market Context</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">Target Niche</span>
                                <p>{opportunity.target_niche}</p>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">Buyer Persona</span>
                                <p>{opportunity.buyer_persona}</p>
                            </div>
                            <div>
                                <span className="block text-slate-400 text-xs uppercase mb-1">Market Gap</span>
                                <p>{opportunity.market_gap}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: AI Analysis */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Validation Scores */}
                    {opportunity.opportunity_scores ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <CheckCircle className="text-green-500 w-5 h-5" />
                                Validation Scores
                            </h2>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                                {['Demand', 'Competition', 'Monetization', 'Complexity', 'Founder Fit'].map((label, i) => {
                                    const key = label.toLowerCase().replace(' ', '_') + '_score';
                                    // Handle camelCase mapping from API vs snake_case from props if mixed
                                    // The type says camelCase in API response but snake_case in Supabase type.
                                    // Let's assume standard object access.
                                    // I'll use a helper or explicit access.
                                    const score = opportunity.opportunity_scores?.[key] || 0;

                                    return (
                                        <div key={label} className="text-center">
                                            <div className="relative w-16 h-16 mx-auto mb-2 flex items-center justify-center rounded-full border-4 border-indigo-100">
                                                <span className="text-lg font-bold text-indigo-600">{score}</span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{label}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm mb-2">AI Analysis</h4>
                                <p className="text-sm text-slate-600 italic">
                                    {/* Assuming analysis is a json object, we need to deserialize if text or just show summary */}
                                    "{opportunity.opportunity_scores.analysis?.demand || 'Analysis ready.'}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center">
                            <p className="text-slate-500">Run validation to see scores, monetization map, and execution plan.</p>
                        </div>
                    )}

                    {/* Execution Plan & Monetization (Only if validated) */}
                    {opportunity.execution_plans && (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Execution & Monetization</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-medium text-indigo-600 mb-3 uppercase text-xs">Monetization Strategy</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Model</span>
                                            <span className="font-medium">{opportunity.monetization_maps?.revenue_model}</span>
                                        </li>
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Est. ARPU</span>
                                            <span className="font-medium">${opportunity.monetization_maps?.estimated_arpu}</span>
                                        </li>
                                        <li className="flex justify-between border-b border-slate-100 pb-2">
                                            <span className="text-slate-500">Time to Revenue</span>
                                            <span className="font-medium">{opportunity.monetization_maps?.time_to_revenue}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-indigo-600 mb-3 uppercase text-xs">MVP Roadmap</h4>
                                    <ul className="space-y-3">
                                        {opportunity.execution_plans?.mvp_features?.slice(0, 3).map((f: any, i: number) => (
                                            <li key={i} className="text-sm flex items-start gap-2">
                                                <div className="min-w-4 mt-1 w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                    {i + 1}
                                                </div>
                                                <span>{f.feature || f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
