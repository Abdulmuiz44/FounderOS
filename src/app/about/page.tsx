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

            <main className="max-w-3xl mx-auto px-6 py-20 md:py-32">
                <h1 className="text-4xl md:text-5xl font-bold mb-8">We're tired of seeing founders fail for the wrong reasons.</h1>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-[var(--muted)]">
                    <p className="text-xl text-[var(--foreground)] leading-relaxed">
                        Every day, brilliant builders waste thousands of hours writing code for products that nobody wants. It's the "Build Trap" — and we've been there.
                    </p>

                    <p>
                        You get an idea. You get excited. You skip validation because "I'll just build an MVP real quick." Three months later, you launch, and... silence. No users. No revenue. Just burnout and a GitHub repo full of code that will never be used.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-12 flex items-center gap-2">
                        <Target className="w-6 h-6 text-red-500" />
                        The Problem: Execution without Direction
                    </h2>
                    <p>
                        The problem isn't your coding skills. It's your process. We applaud "shipping fast," but shipping the wrong thing fast just gets you to the wrong destination quicker.
                    </p>

                    <h2 className="text-2xl font-bold text-[var(--foreground)] mt-12 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-green-500" />
                        Our Mission
                    </h2>
                    <p>
                        FounderOS exists to force you to pause, validate, and <strong>then</strong> build. We use AI to act as your "cofounder" who isn't afraid to tell you when an idea is bad.
                    </p>
                    <p>
                        We want to help 10,000 solo founders build profitable, sustainable businesses by ensuring they only write code for ideas that have market potential.
                    </p>

                    <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl mt-12">
                        <p className="font-serif italic text-xl text-[var(--foreground)]">
                            "The goal is not just to build, but to build the right thing."
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
