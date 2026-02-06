import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Target, Heart, Shield } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-6xl mx-auto">
                <Link href="/" className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
                <span className="font-bold">FounderOS</span>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20 md:py-32">
                <div className="space-y-6 text-center mb-20">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        We build tools for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-violet-500">obsessed</span>.
                    </h1>
                    <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
                        FounderOS is the operating system for solo founders who are tired of guessing and ready to build profitable, validated businesses.
                    </p>
                </div>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-16 text-[var(--muted)]">

                    {/* The Origin Story */}
                    <section>
                        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">The Origin Story</h2>
                        <p className="text-lg leading-relaxed">
                            It started with a folder of 12 dead projects.
                        </p>
                        <p>
                            In 2023, our team looked at our GitHub repositories and realized a painful truth: we were excellent at writing code, but terrible at picking problems. We had built beautiful apps that solved problems nobody had. We had optimized databases for users that never showed up.
                        </p>
                        <p>
                            We realized the "Indie Hacker" dream was broken. The advice "just ship it" is dangerous when you're shipping into a void.
                        </p>
                        <p>
                            We decided to build a tool that would prevent us from ever writing a line of code again until we had <strong>proof</strong> that it mattered. That tool became FounderOS.
                        </p>
                    </section>

                    {/* The Philosophy */}
                    <section className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-3xl my-12">
                        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-blue-500" />
                            Our Core Philosophy
                        </h2>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">1</div>
                                <div>
                                    <strong className="text-[var(--foreground)] block">Validation First, Code Last.</strong>
                                    Writing code is the most expensive way to test an idea. We validate with data first.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold shrink-0">2</div>
                                <div>
                                    <strong className="text-[var(--foreground)] block">Data Over Intuition.</strong>
                                    Your gut feeling is biased. Search volume and competitor revenue data are not.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center font-bold shrink-0">3</div>
                                <div>
                                    <strong className="text-[var(--foreground)] block">Consistency via Systems.</strong>
                                    Motivation is fleeting. Systems—like our streak tracking and Github sync—keep you shipping.
                                </div>
                            </li>
                        </ul>
                    </section>

                    {/* The Mission */}
                    <section>
                        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-6">Our Mission</h2>
                        <p>
                            We're on a mission to help <strong>10,000 solo founders</strong> reach financial independence by building sustainable, validated micro-SaaS businesses.
                        </p>
                        <p>
                            We believe that with the right tools, one person can do the work of a 10-person team. AI has leveled the playing field, but only for those who know how to use it strategically. FounderOS is that strategy, codified into software.
                        </p>
                    </section>

                    <div className="not-prose mt-16 text-center">
                        <Link href="/signup">
                            <button className="bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                Join the Movement
                            </button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
