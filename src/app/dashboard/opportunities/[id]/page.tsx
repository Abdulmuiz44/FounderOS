'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, BarChart3, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { Opportunity, OpportunityScore, ExecutionPlan, MonetizationMap, MomTestScript } from '@/modules/opportunity-intelligence/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [opportunity, setOpportunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [converting, setConverting] = useState(false);
    const [momScript, setMomScript] = useState<MomTestScript | null>(null);
    const [generatingScript, setGeneratingScript] = useState(false);

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
        setConverting(true);
        try {
            const res = await fetch(`/api/opportunities/${id}/convert`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                router.push(data.redirectUrl);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setConverting(false);
        }
    };

    const handleGenerateScript = async () => {
        setGeneratingScript(true);
        try {
            const res = await fetch(`/api/opportunities/${id}/mom-test`, { method: 'POST' });
            const data = await res.json();
            if (data.script) {
                setMomScript(data.script);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingScript(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-[var(--muted)]" /></div>;
    if (!opportunity) return <div className="p-12 text-center text-[var(--muted)]">Opportunity not found</div>;

    return (
        <div className="flex flex-col h-full bg-[var(--background)] overflow-y-auto">
            <div className="max-w-6xl mx-auto w-full p-6 md:p-8 pb-32">
                {/* Back Link */}
                <Link href="/dashboard/opportunities" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Idea Lab
                </Link>

                {/* Header */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-3">{opportunity.title}</h1>
                            <p className="text-lg text-[var(--muted)] leading-relaxed max-w-2xl">{opportunity.problem_statement}</p>
                        </div>
                        <div className="flex flex-col gap-3 shrink-0">
                            {!opportunity.opportunity_scores ? (
                                <Button
                                    onClick={handleRunValidation}
                                    disabled={validating}
                                    className="gap-2 h-12 px-6"
                                >
                                    {validating ? <Loader2 className="animate-spin w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                                    Run Validation AI
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-2 items-end">
                                    <span className="text-xs uppercase font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                        Validated Idea
                                    </span>
                                    {opportunity.status !== 'CONVERTED' && (
                                        <Button
                                            onClick={handleConvert}
                                            disabled={converting}
                                            className="gap-2 h-12 px-6 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90"
                                        >
                                            {converting ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            Start Project Execution
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Context */}
                    <div className="space-y-6">
                        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                <span className="bg-[var(--foreground)] w-1 h-4 rounded-full"></span>
                                Market Context
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <span className="block text-[var(--muted)] text-xs uppercase font-bold tracking-wider mb-2">Target Niche</span>
                                    <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed">{opportunity.target_niche}</p>
                                </div>
                                <div className="w-full h-px bg-[var(--border)]"></div>
                                <div>
                                    <span className="block text-[var(--muted)] text-xs uppercase font-bold tracking-wider mb-2">Buyer Persona</span>
                                    <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed">{opportunity.buyer_persona}</p>
                                </div>
                                <div className="w-full h-px bg-[var(--border)]"></div>
                                <div>
                                    <span className="block text-[var(--muted)] text-xs uppercase font-bold tracking-wider mb-2">Market Gap</span>
                                    <p className="text-sm font-medium text-[var(--foreground)] leading-relaxed">{opportunity.market_gap}</p>
                                </div>
                            </div>
                        </div>

                        {/* Mom Test Tools */}
                        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                <span className="bg-pink-500 w-1 h-4 rounded-full"></span>
                                The Mom Test Helper
                            </h3>
                            <p className="text-sm text-[var(--muted)] mb-4">
                                Generate non-leading interview questions to validate if this problem is real.
                            </p>
                            {!momScript ? (
                                <Button
                                    onClick={handleGenerateScript}
                                    disabled={generatingScript}
                                    className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                                >
                                    {generatingScript ? <Loader2 className="animate-spin w-4 h-4" /> : 'Generate Script'}
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-xs font-bold uppercase text-[var(--muted)]">Screener</span>
                                        <ul className="list-disc pl-4 text-sm mt-1 space-y-1">
                                            {momScript.screenerQuestions.map((q: string, i: number) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="w-full h-px bg-[var(--border)]"></div>
                                    <div>
                                        <span className="text-xs font-bold uppercase text-[var(--muted)]">Deep Dive</span>
                                        <div className="space-y-3 mt-2">
                                            {momScript.deepDiveQuestions.map((q: any, i: number) => (
                                                <div key={i} className="bg-[var(--background)] p-3 rounded border border-[var(--border)]">
                                                    <p className="text-sm font-medium">{q.question}</p>
                                                    <p className="text-xs text-[var(--muted)] italic mt-1">Goal: {q.goal}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: AI Analysis */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Validation Scores */}
                        {opportunity.opportunity_scores ? (
                            <div className="bg-[var(--card)] p-6 md:p-8 rounded-xl border border-[var(--border)] shadow-sm">
                                <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-[var(--foreground)]">
                                    <CheckCircle className="text-green-500 w-6 h-6" />
                                    Validation Scores
                                </h2>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-8">
                                    {['Demand', 'Competition', 'Monetization', 'Complexity', 'Founder Fit'].map((label, i) => {
                                        const key = label.toLowerCase().replace(' ', '_') + '_score';
                                        // @ts-ignore
                                        const score = opportunity.opportunity_scores?.[key] || 0;
                                        const color = score >= 85 ? 'text-green-500 border-green-500/30' :
                                            score >= 70 ? 'text-blue-500 border-blue-500/30' :
                                                'text-orange-500 border-orange-500/30';

                                        return (
                                            <div key={label} className="text-center group">
                                                <div className={`relative w-16 h-16 mx-auto mb-3 flex items-center justify-center rounded-full border-4 ${color} bg-[var(--background)] transition-transform group-hover:scale-110`}>
                                                    <span className={`text-xl font-bold ${color.split(' ')[0]}`}>{score}</span>
                                                </div>
                                                <span className="text-xs font-bold uppercase text-[var(--muted)] tracking-tight">{label}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="bg-[var(--background)] p-5 rounded-xl border border-[var(--border)] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                    <h4 className="font-bold text-sm mb-2 text-[var(--foreground)]">AI Analysis Summary</h4>
                                    <p className="text-sm text-[var(--muted)] leading-relaxed italic">
                                        "{opportunity.opportunity_scores.analysis?.demand || 'The market signals are strong. Proceed with validation.'}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[var(--card)] border-2 border-dashed border-[var(--border)] rounded-xl p-12 text-center opacity-70">
                                <BarChart3 className="w-10 h-10 mx-auto mb-4 text-[var(--muted)]" />
                                <p className="text-[var(--muted)] font-medium">Run validation to generate scores, predictions, and an execution roadmap.</p>
                            </div>
                        )}

                        {/* Execution Plan & Monetization (Only if validated) */}
                        {opportunity.execution_plans && (
                            <div className="bg-[var(--card)] p-6 md:p-8 rounded-xl border border-[var(--border)] shadow-sm">
                                <h2 className="text-xl font-bold mb-8 text-[var(--foreground)] border-b border-[var(--border)] pb-4">Strategy & Execution</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                    <div>
                                        <h4 className="font-bold text-indigo-500 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            Monetization Model
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="bg-[var(--background)] p-3 rounded-lg border border-[var(--border)]">
                                                <span className="block text-[var(--muted)] text-xs mb-1">Primary Model</span>
                                                <span className="font-bold text-[var(--foreground)]">{opportunity.monetization_maps?.revenue_model}</span>
                                            </div>
                                            <li className="flex justify-between items-center py-2 border-b border-[var(--border)] px-1">
                                                <span className="text-sm text-[var(--muted)]">Est. ARPU</span>
                                                <span className="font-mono font-bold text-[var(--foreground)]">${opportunity.monetization_maps?.estimated_arpu}</span>
                                            </li>
                                            <li className="flex justify-between items-center py-2 border-b border-[var(--border)] px-1">
                                                <span className="text-sm text-[var(--muted)]">Time to Revenue</span>
                                                <span className="font-mono font-bold text-[var(--foreground)]">{opportunity.monetization_maps?.time_to_revenue}</span>
                                            </li>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-indigo-500 mb-4 uppercase text-xs tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                            MVP Roadmap
                                        </h4>
                                        <ul className="space-y-4">
                                            {opportunity.execution_plans?.mvp_features?.slice(0, 3).map((f: any, i: number) => (
                                                <li key={i} className="text-sm flex items-start gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)] hover:border-[var(--foreground)]/30 transition-colors">
                                                    <div className="min-w-5 mt-0.5 w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-[var(--foreground)] leading-tight">{f.feature || f}</span>
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
        </div>
    );
}
