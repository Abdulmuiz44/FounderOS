import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Target, Lightbulb, GitCommit, Shield, Zap, BarChart3, Search } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-6xl mx-auto">
                <Link href="/" className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <span className="font-bold text-xl tracking-tighter">FounderOS</span>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20 md:py-32">
                <div className="space-y-24">
                    {/* Hero Section */}
                    <div className="space-y-8 text-center md:text-left">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            Moving from <span className="text-blue-600 dark:text-blue-400">"Can we build it?"</span><br />
                            to <span className="text-violet-600 dark:text-violet-400">"Should we build it?"</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-[var(--muted)] max-w-2xl leading-relaxed">
                            FounderOS helps founders choose ideas that convert before they spend months building. We replace intuition with market evidence and an execution plan you can ship from.
                        </p>
                    </div>

                    {/* Mission Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">The Build Trap</h2>
                            <p className="text-lg text-[var(--muted)] leading-relaxed">
                                Most founders fail because they build before validating buyer demand.
                                That build-first pattern burns time, money, and motivation—then launches to silence.
                            </p>
                            <p className="text-lg text-[var(--muted)] leading-relaxed">
                                FounderOS was built to break that cycle with a practical decision system: validate demand, identify a wedge, and execute from a clear plan.
                            </p>
                        </div>
                        <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-3xl shadow-xl">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-red-500">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-semibold uppercase tracking-wider text-sm">Conviction Engine</span>
                                </div>
                                <h3 className="text-2xl font-bold">Evidence-Driven Go/No-Go</h3>
                                <p className="text-[var(--muted)]">
                                    Our engine analyzes demand signals, competitor positioning, and pricing patterns to help you decide what to build—and what to reject early.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How it Works / Pillars */}
                    <div className="space-y-12">
                        <div className="text-center max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Revenue-First Workflow</h2>
                            <p className="text-[var(--muted)]">A practical path from raw idea to validated execution.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
                                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                                    <Lightbulb className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">1. Generate</h3>
                                <p className="text-[var(--muted)] text-sm leading-relaxed">
                                    Generate ideas anchored in painful buyer problems and your real strengths.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4 ring-2 ring-violet-500/20">
                                <div className="w-12 h-12 bg-violet-500/10 text-violet-500 rounded-xl flex items-center justify-center">
                                    <Search className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">2. Validate</h3>
                                <p className="text-[var(--muted)] text-sm leading-relaxed">
                                    Score demand, competition, monetization, and founder fit before you write code.
                                </p>
                            </div>

                            <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
                                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                                    <GitCommit className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold">3. Execute</h3>
                                <p className="text-[var(--muted)] text-sm leading-relaxed">
                                    Move into execution with a full implementation guide and momentum tracking.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className="py-20 border-y border-[var(--border)]">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <h2 className="text-3xl font-bold">Built for Builders</h2>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="mt-1 text-blue-500"><Zap className="w-5 h-5" /></div>
                                        <div>
                                            <h4 className="font-bold">The Serial Maker</h4>
                                            <p className="text-[var(--muted)] text-sm">Stop building a graveyard of unused repositories and start building assets.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 text-violet-500"><Target className="w-5 h-5" /></div>
                                        <div>
                                            <h4 className="font-bold">The Solopreneur</h4>
                                            <p className="text-[var(--muted)] text-sm">Maximize your limited time by only working on high-potential opportunities.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1 text-green-500"><BarChart3 className="w-5 h-5" /></div>
                                        <div>
                                            <h4 className="font-bold">Product Strategists</h4>
                                            <p className="text-[var(--muted)] text-sm">Validate internal features and new product lines with real-time market data.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600/5 to-violet-600/5 rounded-3xl p-12 border border-[var(--border)]">
                                <blockquote className="space-y-6">
                                    <p className="text-2xl font-medium italic leading-relaxed text-[var(--foreground)]">
                                        "FounderOS doesn't just save you time—it saves you from the heartbreak of building something that doesn't matter."
                                    </p>
                                    <footer className="text-[var(--muted)] font-medium">— The FounderOS Philosophy</footer>
                                </blockquote>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center space-y-8 pb-20">
                        <h2 className="text-4xl font-bold tracking-tight">Ready to stop guessing and ship with proof?</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup">
                                <button className="bg-[var(--foreground)] text-[var(--background)] px-10 py-5 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                    Start Validating Now
                                </button>
                            </Link>
                            <Link href="/login">
                                <button className="px-10 py-5 rounded-full font-bold text-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-all">
                                    Sign In
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
