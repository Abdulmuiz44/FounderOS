'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, Loader2, Search, Target } from 'lucide-react';

type IdeaDraft = {
    title: string;
    problem_statement: string;
    target_niche: string;
    market_gap: string;
    why_now: string;
    buyer_persona: string;
};

const EMPTY_IDEA: IdeaDraft = {
    title: '',
    problem_statement: '',
    target_niche: '',
    market_gap: '',
    why_now: '',
    buyer_persona: ''
};

export default function CreateOpportunityPage() {
    const router = useRouter();
    const [idea, setIdea] = useState<IdeaDraft>(EMPTY_IDEA);
    const [loading, setLoading] = useState(false);

    const updateField = (field: keyof IdeaDraft, value: string) => {
        setIdea((current) => ({ ...current, [field]: value }));
    };

    const submitIdea = async () => {
        setLoading(true);

        try {
            const res = await fetch('/api/opportunities/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ opportunity: idea })
            });

            const data = await res.json();
            if (!res.ok || !data.opportunity?.id) {
                throw new Error(data.error || 'Failed to create opportunity');
            }

            router.push(`/dashboard/opportunities/${data.opportunity.id}`);
        } catch (error) {
            console.error(error);
            alert('Unable to submit idea for validation. Please check the form and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[var(--background)] p-6 pb-20">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--muted)]">
                        <Search className="h-4 w-4 text-blue-500" />
                        Full Validation Intelligence Engine
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)]">
                        Enter your idea and get a full go/no-go validation plus execution direction.
                    </h1>
                    <p className="max-w-3xl text-lg leading-relaxed text-[var(--muted)]">
                        FounderOS now treats idea validation as research work, not just prompt output. Submit one idea and the engine will assess demand, competitors, monetization, go-to-market angles, and validation risks.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
                    <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm md:p-8">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-600">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--foreground)]">Idea Intake</h2>
                                <p className="text-sm text-[var(--muted)]">Give the engine enough context to research the market properly.</p>
                            </div>
                        </div>

                        <div className="grid gap-5">
                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-[var(--foreground)]">Idea title</span>
                                <input
                                    className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-blue-500"
                                    placeholder="AI demand sensing for Shopify brands"
                                    value={idea.title}
                                    onChange={(event) => updateField('title', event.target.value)}
                                />
                            </label>

                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-[var(--foreground)]">Problem statement</span>
                                <textarea
                                    className="min-h-28 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-blue-500"
                                    placeholder="Describe the painful job-to-be-done, current workaround, and why the problem matters."
                                    value={idea.problem_statement}
                                    onChange={(event) => updateField('problem_statement', event.target.value)}
                                />
                            </label>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label className="grid gap-2">
                                    <span className="text-sm font-medium text-[var(--foreground)]">Target niche</span>
                                    <input
                                        className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-blue-500"
                                        placeholder="Independent ecommerce brands doing $1M-$10M GMV"
                                        value={idea.target_niche}
                                        onChange={(event) => updateField('target_niche', event.target.value)}
                                    />
                                </label>

                                <label className="grid gap-2">
                                    <span className="text-sm font-medium text-[var(--foreground)]">Buyer persona</span>
                                    <input
                                        className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-blue-500"
                                        placeholder="Founder or growth lead"
                                        value={idea.buyer_persona}
                                        onChange={(event) => updateField('buyer_persona', event.target.value)}
                                    />
                                </label>
                            </div>

                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-[var(--foreground)]">Market gap hypothesis</span>
                                <textarea
                                    className="min-h-24 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-blue-500"
                                    placeholder="What do existing products miss? Be explicit about the wedge."
                                    value={idea.market_gap}
                                    onChange={(event) => updateField('market_gap', event.target.value)}
                                />
                            </label>

                            <label className="grid gap-2">
                                <span className="text-sm font-medium text-[var(--foreground)]">Why now</span>
                                <textarea
                                    className="min-h-24 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition focus:border-blue-500"
                                    placeholder="What changed in the market, technology, regulation, or buyer behavior?"
                                    value={idea.why_now}
                                    onChange={(event) => updateField('why_now', event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-6">
                            <p className="text-sm text-[var(--muted)]">
                                Submission creates the opportunity, runs validation, and prepares a build-ready execution path.
                            </p>
                            <button
                                onClick={submitIdea}
                                disabled={loading || Object.values(idea).some((value) => !value.trim())}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--foreground)] px-6 py-3 font-semibold text-[var(--background)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                                Submit For Validation
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </div>
                    </section>

                    <aside className="space-y-5">
                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">What you get in the report</h3>
                            <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
                                <p>Searches the web for demand indicators, buyer pain, and category momentum.</p>
                                <p>Maps direct and adjacent competitors, then highlights the most credible differentiation wedge.</p>
                                <p>Scores monetization, complexity, founder fit, and recommends validation experiments before building.</p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-[var(--foreground)]">Best inputs</h3>
                            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                                <p>Use a specific buyer, not “everyone”.</p>
                                <p>Name the current workaround if you know it.</p>
                                <p>State your wedge in one sentence.</p>
                                <p>Explain why timing may be favorable right now.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
