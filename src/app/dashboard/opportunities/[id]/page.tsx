'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, BarChart3, ChevronRight, Play, ArrowLeft, Layout, Sparkles, Copy, FileText, Star, HelpCircle, DollarSign, UserCheck } from 'lucide-react';
import { MomTestScript, CompetitorAnalysis, WaitlistContent, MarketingCopy, ValidationReport } from '@/modules/opportunity-intelligence/types';
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
    const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
    const [analyzingCompetitors, setAnalyzingCompetitors] = useState(false);
    const [waitlistContent, setWaitlistContent] = useState<WaitlistContent | null>(null);
    const [generatingWaitlist, setGeneratingWaitlist] = useState(false);
    const [marketingCopy, setMarketingCopy] = useState<MarketingCopy | null>(null);
    const [generatingCopy, setGeneratingCopy] = useState(false);
    const [activeCopyTab, setActiveCopyTab] = useState<'homepage' | 'about' | 'pricing' | 'dashboard'>('homepage');
    const [validationMode, setValidationMode] = useState<'ai' | 'fallback' | null>(null);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/opportunities/${id}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) setOpportunity(data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const validationReport: ValidationReport | undefined = opportunity?.opportunity_scores?.analysis?.validationReport;

    const applyValidationResult = (data: any) => {
        if (data.scores) {
            setOpportunity((prev: any) => ({
                ...prev,
                opportunity_scores: data.scores,
                status: 'VALIDATED'
            }));
            setValidationMode(data.validationMode || 'ai');
            setValidationMessage(data.validationMessage || null);
            return;
        }

        throw new Error('Validation API returned no scores');
    };

    useEffect(() => {
        if (!opportunity || validating) {
            return;
        }

        if (opportunity.status !== 'DRAFT' && opportunity.status !== 'VALIDATING') {
            return;
        }

        const run = async () => {
            setValidating(true);
            try {
                const res = await fetch('/api/opportunities/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ opportunityId: id })
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Validation request failed: ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
                }

                const data = await res.json();
                applyValidationResult(data);
            } catch (error) {
                console.error(error);
                setOpportunity((prev: any) => ({ ...prev, status: 'VALIDATION_FAILED' }));
            } finally {
                setValidating(false);
            }
        };

        run();
    }, [id, opportunity, validating]);

    const handleRunValidation = async () => {
        setValidating(true);
        setValidationMode(null);
        setValidationMessage(null);
        setOpportunity((prev: any) => ({ ...prev, status: 'VALIDATING' }));
        try {
            const res = await fetch('/api/opportunities/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunityId: id })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Validation request failed: ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
            }

            const data = await res.json();
            applyValidationResult(data);
        } catch (e) {
            console.error(e);
            setOpportunity((prev: any) => ({ ...prev, status: 'VALIDATION_FAILED' }));
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
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error: ${res.status} - ${text.substring(0, 100)}`);
            }
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

    const handleAnalyzeCompetitors = async () => {
        setAnalyzingCompetitors(true);
        try {
            const res = await fetch(`/api/opportunities/${id}/competitor-spy`, { method: 'POST' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error: ${res.status} - ${text.substring(0, 100)}`);
            }
            const data = await res.json();

            if (data.analysis) {
                setCompetitorAnalysis(data.analysis);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzingCompetitors(false);
        }
    };

    const handleGenerateWaitlist = async () => {
        setGeneratingWaitlist(true);
        try {
            const res = await fetch(`/api/opportunities/${id}/waitlist`, { method: 'POST' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error: ${res.status} - ${text.substring(0, 100)}`);
            }
            const data = await res.json();

            if (data.content) {
                setWaitlistContent(data.content);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingWaitlist(false);
        }
    };

    const handleGenerateMarketingCopy = async () => {
        setGeneratingCopy(true);
        try {
            const res = await fetch(`/api/opportunities/${id}/marketing-copy`, { method: 'POST' });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error: ${res.status} - ${text.substring(0, 100)}`);
            }
            const data = await res.json();
            if (data.copy) {
                setMarketingCopy(data.copy);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingCopy(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
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
                                <>
                                    <Button
                                        onClick={handleRunValidation}
                                        disabled={validating || opportunity.status === 'VALIDATING'}
                                        className="gap-2 h-12 px-6"
                                    >
                                        {validating ? <Loader2 className="animate-spin w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                                        {opportunity.status === 'VALIDATING' || validating ? 'Validating In Background' : 'Run Validation AI'}
                                    </Button>
                                    {validationMessage && (
                                        <p className={`max-w-sm text-xs text-right ${validationMode === 'fallback' ? 'text-amber-500' : 'text-[var(--muted)]'}`}>
                                            {validationMessage}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 items-end">
                                    <span className="text-xs uppercase font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                        Validated Idea
                                    </span>
                                    {validationMessage && (
                                        <p className={`max-w-sm text-xs text-right ${validationMode === 'fallback' ? 'text-amber-500' : 'text-[var(--muted)]'}`}>
                                            {validationMessage}
                                        </p>
                                    )}
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
                            {opportunity.status === 'VALIDATION_FAILED' && (
                                <span className="text-xs text-red-500 font-medium">Validation failed. Retry to regenerate the research report.</span>
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

                        {/* Competitor Spy */}
                        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                <span className="bg-red-500 w-1 h-4 rounded-full"></span>
                                Competitor Spy
                            </h3>
                            <p className="text-sm text-[var(--muted)] mb-4">
                                Identify competitors and find your winning angle.
                            </p>
                            {!competitorAnalysis ? (
                                <Button
                                    onClick={handleAnalyzeCompetitors}
                                    disabled={analyzingCompetitors}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                                >
                                    {analyzingCompetitors ? <Loader2 className="animate-spin w-4 h-4" /> : 'Analyze Competition'}
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                                        <span className="text-xs font-bold uppercase text-red-600 block mb-1">Market Gap</span>
                                        <p className="text-sm text-[var(--foreground)] italic">"{competitorAnalysis.marketGapSummary}"</p>
                                    </div>
                                    <div className="space-y-3">
                                        {competitorAnalysis.competitors.map((comp, i) => (
                                            <div key={i} className="bg-[var(--background)] p-3 rounded border border-[var(--border)]">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-sm">{comp.name}</span>
                                                    {comp.url && <a href={comp.url} target="_blank" className="text-xs text-blue-500 hover:underline">Visit</a>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                    <div>
                                                        <span className="text-green-600 font-semibold block">Strength</span>
                                                        <span className="text-[var(--muted)]">{comp.strength}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-red-500 font-semibold block">Weakness</span>
                                                        <span className="text-[var(--muted)]">{comp.weakness}</span>
                                                    </div>
                                                </div>
                                                <div className="border-t border-[var(--border)] pt-2 mt-1">
                                                    <span className="text-indigo-500 font-semibold text-xs block">How we win</span>
                                                    <span className="text-xs text-[var(--foreground)]">{comp.differentiationOpportunity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Waitlist Generator */}
                        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                            <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                <span className="bg-purple-500 w-1 h-4 rounded-full"></span>
                                Waitlist Page Builder
                            </h3>
                            <p className="text-sm text-[var(--muted)] mb-4">
                                Generate high-conversion copy for your pre-launch landing page.
                            </p>
                            {!waitlistContent ? (
                                <Button
                                    onClick={handleGenerateWaitlist}
                                    disabled={generatingWaitlist}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                                >
                                    {generatingWaitlist ? <Loader2 className="animate-spin w-4 h-4" /> : 'Generate Landing Page'}
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)] text-center">
                                        <h1 className="text-xl font-bold mb-2">{waitlistContent.headline}</h1>
                                        <p className="text-[var(--muted)] mb-4">{waitlistContent.subheadline}</p>
                                        <Button className="mx-auto bg-black text-white px-6 w-auto">{waitlistContent.ctaText}</Button>
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-bold uppercase text-[var(--muted)]">Key Benefits</span>
                                        {waitlistContent.benefits.map((b, i) => (
                                            <div key={i} className="text-sm pl-2 border-l-2 border-purple-500">
                                                <span className="font-semibold block">{b.title}</span>
                                                <span className="text-[var(--muted)]">{b.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-purple-500/10 p-3 rounded-lg text-xs text-purple-600 font-medium text-center">
                                        Viral Mechanic: {waitlistContent.viralMechanic}
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
                                        "{validationReport?.executiveSummary || opportunity.opportunity_scores.analysis?.demand || 'The market signals are strong. Proceed with validation.'}"
                                    </p>
                                </div>

                                {validationReport && (
                                    <div className="mt-6 grid gap-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Verdict</span>
                                                <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{validationReport.verdict.replaceAll('_', ' ')}</p>
                                                <p className="mt-2 text-sm text-[var(--muted)]">Confidence: {validationReport.confidence}/100</p>
                                                <p className="mt-3 text-sm text-[var(--muted)]">{validationReport.marketSizeSummary}</p>
                                            </div>
                                            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Launch Channels</span>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {validationReport.launchChannels.slice(0, 6).map((channel) => (
                                                        <span key={channel} className="rounded-full bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--foreground)] border border-[var(--border)]">
                                                            {channel}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                                            <h4 className="text-sm font-bold text-[var(--foreground)]">Demand Signals</h4>
                                            <div className="mt-4 space-y-3">
                                                {validationReport.demandSignals.slice(0, 4).map((signal) => (
                                                    <div key={`${signal.signal}-${signal.evidence}`} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="font-medium text-[var(--foreground)]">{signal.signal}</p>
                                                            <span className="text-xs font-bold text-blue-500">{signal.strength}</span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-[var(--muted)]">{signal.evidence}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                                            <h4 className="text-sm font-bold text-[var(--foreground)]">Source-backed Competitors</h4>
                                            <div className="mt-4 space-y-3">
                                                {validationReport.competitors.slice(0, 4).map((competitor) => (
                                                    <div key={`${competitor.name}-${competitor.url || competitor.positioning}`} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="font-semibold text-[var(--foreground)]">{competitor.name}</p>
                                                                <p className="mt-1 text-sm text-[var(--muted)]">{competitor.positioning}</p>
                                                            </div>
                                                            {competitor.url && (
                                                                <a href={competitor.url} target="_blank" className="text-xs font-medium text-blue-500 hover:underline">
                                                                    Visit
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-2">
                                                            <p><span className="font-medium text-[var(--foreground)]">Strength:</span> {competitor.strength}</p>
                                                            <p><span className="font-medium text-[var(--foreground)]">Weakness:</span> {competitor.weakness}</p>
                                                        </div>
                                                        <p className="mt-3 text-sm text-[var(--foreground)]"><span className="font-medium">Wedge:</span> {competitor.differentiationOpportunity}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                                                <h4 className="text-sm font-bold text-[var(--foreground)]">Primary Risks</h4>
                                                <div className="mt-4 space-y-3">
                                                    {validationReport.risks.slice(0, 4).map((risk) => (
                                                        <div key={`${risk.risk}-${risk.mitigation}`} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="font-medium text-[var(--foreground)]">{risk.risk}</p>
                                                                <span className="text-xs font-bold text-orange-500">{risk.severity}</span>
                                                            </div>
                                                            <p className="mt-2 text-sm text-[var(--muted)]">{risk.mitigation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                                                <h4 className="text-sm font-bold text-[var(--foreground)]">Next Validation Experiments</h4>
                                                <div className="mt-4 space-y-3">
                                                    {validationReport.validationExperiments.slice(0, 4).map((experiment) => (
                                                        <div key={`${experiment.experiment}-${experiment.successMetric}`} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
                                                            <p className="font-medium text-[var(--foreground)]">{experiment.experiment}</p>
                                                            <p className="mt-2 text-sm text-[var(--muted)]">{experiment.execution}</p>
                                                            <p className="mt-2 text-xs text-[var(--muted)]">Success metric: {experiment.successMetric}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-5">
                                            <h4 className="text-sm font-bold text-[var(--foreground)]">Research Sources</h4>
                                            <div className="mt-4 space-y-3">
                                                {validationReport.sources.slice(0, 6).map((source) => (
                                                    <a
                                                        key={`${source.title}-${source.url}`}
                                                        href={source.url}
                                                        target="_blank"
                                                        className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-blue-500/40"
                                                    >
                                                        <p className="font-medium text-[var(--foreground)]">{source.title}</p>
                                                        <p className="mt-1 text-xs uppercase tracking-wider text-[var(--muted)]">{source.publisher}</p>
                                                        <p className="mt-2 text-sm text-[var(--muted)]">{source.evidence}</p>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
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

                        {/* Marketing Copy Studio */}
                        <div className="bg-[var(--card)] p-6 md:p-8 rounded-xl border border-[var(--border)] shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-[var(--border)]">
                                <h2 className="text-xl font-bold flex items-center gap-3 text-[var(--foreground)]">
                                    <Sparkles className="text-amber-500 w-6 h-6" />
                                    Marketing Copy Studio
                                </h2>
                                <Button
                                    onClick={handleGenerateMarketingCopy}
                                    disabled={generatingCopy}
                                    className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                                >
                                    {generatingCopy ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    {marketingCopy ? 'Regenerate All Copy' : 'Generate Full Marketing Suite'}
                                </Button>
                            </div>

                            {!marketingCopy ? (
                                <div className="p-12 text-center bg-[var(--background)] rounded-xl border border-dashed border-[var(--border)]">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--muted)] opacity-50" />
                                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Build Your Presence</h3>
                                    <p className="text-[var(--muted)] max-w-sm mx-auto">
                                        Generate long-form, high-conversion copy for your homepage, about page, and pricing strategy in seconds.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Tabs */}
                                    <div className="flex gap-1 p-1 bg-[var(--background)] rounded-lg border border-[var(--border)] overflow-x-auto">
                                        {[
                                            { id: 'homepage', label: 'Homepage', icon: Layout },
                                            { id: 'about', label: 'About', icon: FileText },
                                            { id: 'pricing', label: 'Pricing', icon: DollarSign },
                                            { id: 'dashboard', label: 'Onboarding', icon: UserCheck },
                                        ].map((tab) => {
                                            const Icon = tab.icon;
                                            const active = activeCopyTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setActiveCopyTab(tab.id as any)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all shrink-0 ${active
                                                        ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--border)]'
                                                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                                                        }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {tab.label}
                                                </button>
                                            )
                                        })}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--border)] min-h-[400px]">
                                        {activeCopyTab === 'homepage' && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                {/* Hero Section */}
                                                <div className="relative group p-4 border border-dashed border-transparent hover:border-amber-500/30 rounded-lg transition-colors">
                                                    <button onClick={() => copyToClipboard(`${marketingCopy.homepage.hero.headline}\n${marketingCopy.homepage.hero.subheadline}`)} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-[var(--card)] rounded transition-all"><Copy className="w-4 h-4" /></button>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2 block">Hero Section</span>
                                                    <h3 className="text-2xl font-bold mb-3">{marketingCopy.homepage.hero.headline}</h3>
                                                    <p className="text-[var(--muted)] text-lg leading-relaxed mb-4">{marketingCopy.homepage.hero.subheadline}</p>
                                                    <Button className="bg-[var(--foreground)] text-[var(--background)]">{marketingCopy.homepage.hero.cta}</Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/10">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2 block">The Problem (Agitation)</span>
                                                            <h4 className="font-bold text-lg mb-2">{marketingCopy.homepage.problem.title}</h4>
                                                            <p className="text-sm text-[var(--muted)] leading-relaxed italic">"{marketingCopy.homepage.problem.description}"</p>
                                                        </div>
                                                        <div className="p-4 bg-green-500/5 rounded-lg border border-green-500/10">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-2 block">The Solution</span>
                                                            <h4 className="font-bold text-lg mb-2">{marketingCopy.homepage.solution.title}</h4>
                                                            <p className="text-sm text-[var(--muted)] leading-relaxed">{marketingCopy.homepage.solution.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2 block">Key Features</span>
                                                        <div className="space-y-3">
                                                            {marketingCopy.homepage.features.map((f: any, i: number) => (
                                                                <div key={i} className="p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <CheckCircle className="w-3 h-3 text-indigo-500" />
                                                                        <span className="font-bold text-sm">{f.title}</span>
                                                                    </div>
                                                                    <p className="text-xs text-[var(--muted)] mb-1">{f.description}</p>
                                                                    <p className="text-[10px] font-medium text-indigo-400 italic">Benefit: {f.benefit}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 block">Simulated Social Proof</span>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {marketingCopy.homepage.testimonials_simulated.map((t: any, i: number) => (
                                                            <div key={i} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg relative overflow-hidden">
                                                                <Star className="absolute top-4 right-4 text-amber-500 w-3 h-3 fill-amber-500 opacity-20" />
                                                                <p className="text-sm italic mb-4">"{t.quote}"</p>
                                                                <div>
                                                                    <p className="text-xs font-bold">{t.author}</p>
                                                                    <p className="text-[10px] text-[var(--muted)]">{t.role}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-2 block">F.A.Q.</span>
                                                    <div className="space-y-3">
                                                        {marketingCopy.homepage.faq.map((q: any, i: number) => (
                                                            <div key={i} className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
                                                                <div className="flex items-start gap-2">
                                                                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="text-sm font-bold mb-1">{q.question}</p>
                                                                        <p className="text-sm text-[var(--muted)]">{q.answer}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeCopyTab === 'about' && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto py-4">
                                                <div className="text-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2 block">Mission Statement</span>
                                                    <h3 className="text-2xl font-bold mb-6 italic">"{marketingCopy.about.mission}"</h3>
                                                </div>

                                                <div className="w-full h-px bg-[var(--border)]"></div>

                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-4 block">The Origin Story</span>
                                                    <div className="prose prose-sm prose-invert max-w-none text-[var(--muted)] leading-relaxed space-y-4">
                                                        {marketingCopy.about.story.split('\n\n').map((p: string, i: number) => (
                                                            <p key={i}>{p}</p>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                                                    {marketingCopy.about.values.map((v: string, i: number) => (
                                                        <div key={i} className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-center">
                                                            <span className="text-sm font-bold text-indigo-400">{v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeCopyTab === 'pricing' && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 py-4">
                                                <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/10 mb-8 max-w-xl mx-auto">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2 block text-center">Pricing Strategy</span>
                                                    <p className="text-sm text-amber-900/80 text-center italic">{marketingCopy.pricing.strategy}</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {marketingCopy.pricing.tiers.map((tier: any, i: number) => (
                                                        <div key={i} className={`p-6 rounded-2xl border ${tier.recommended ? 'border-indigo-500 bg-indigo-500/5' : 'border-[var(--border)] bg-[var(--card)]'} flex flex-col h-full relative`}>
                                                            {tier.recommended && (
                                                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Most Popular</span>
                                                            )}
                                                            <h4 className="font-bold text-xl mb-1">{tier.name}</h4>
                                                            <div className="mb-6">
                                                                <span className="text-3xl font-bold">{tier.price}</span>
                                                                <span className="text-[var(--muted)] text-sm ml-1">/mo</span>
                                                            </div>
                                                            <ul className="space-y-3 mb-8 flex-1">
                                                                {tier.features.map((f: string, j: number) => (
                                                                    <li key={j} className="text-sm flex items-start gap-2 text-[var(--muted)]">
                                                                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                                        {f}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            <Button className={tier.recommended ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : ''}>
                                                                Choose {tier.name}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeCopyTab === 'dashboard' && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto py-4">
                                                <div className="bg-green-500/5 p-8 rounded-2xl border border-green-500/10 text-center">
                                                    <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                                    <h3 className="text-2xl font-bold mb-2">{marketingCopy.dashboard_onboarding.welcome_message}</h3>
                                                    <p className="text-[var(--muted)] mb-8">Let's get you set up for success in under 2 minutes.</p>

                                                    <div className="space-y-4 text-left">
                                                        {marketingCopy.dashboard_onboarding.setup_steps.map((s: any, i: number) => (
                                                            <div key={i} className="flex gap-4 p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg">
                                                                <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                                    {i + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-sm mb-1">{s.step}</p>
                                                                    <p className="text-xs text-[var(--muted)]">{s.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
