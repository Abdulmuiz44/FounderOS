import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
                <div className="space-y-12">
                    {/* Opening */}
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                            I wasted 3 years building things nobody wanted.
                        </h1>

                        <p className="text-xl text-[var(--muted)]">
                            This is the story of how 12 failed projects taught me what most founders learn too late.
                        </p>
                    </div>

                    {/* The Story - Line by Line */}
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-[var(--muted)] leading-relaxed">
                        <p>
                            2021. I opened my GitHub.
                        </p>

                        <p>
                            Twelve repositories. Beautiful code. Pixel-perfect UIs. Zero users.
                        </p>

                        <p>
                            I had spent thousands of hours solving problems that didn't exist.
                        </p>

                        <p>
                            A task manager for freelancers. (Trello exists.)
                        </p>

                        <p>
                            A portfolio builder for designers. (Nobody asked for it.)
                        </p>

                        <p>
                            An AI writing tool. (Launched the week ChatGPT went viral. Timing: catastrophic.)
                        </p>

                        <p className="text-xl font-semibold text-[var(--foreground)] pt-8">
                            The pattern was obvious. I was addicted to building, not validating.
                        </p>

                        <p>
                            Every indie hacker shouted: "Just ship it!"
                        </p>

                        <p>
                            So I did. Again. And again. Into the void.
                        </p>

                        <p>
                            The advice was incomplete. It should have been: "Ship it... if anyone cares."
                        </p>

                        <p className="text-xl font-semibold text-[var(--foreground)] pt-8">
                            I decided to build one last thing.
                        </p>

                        <p>
                            A tool that would save me from myself.
                        </p>

                        <p>
                            A system that would force me to answer three questions before I wrote a single line of code:
                        </p>

                        <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-2xl not-prose my-8">
                            <ol className="space-y-4 text-lg">
                                <li className="flex gap-4">
                                    <span className="text-blue-500 font-bold">1.</span>
                                    <span>Is there search volume for this problem?</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-violet-500 font-bold">2.</span>
                                    <span>Who's already solving it, and what are they missing?</span>
                                </li>
                                <li className="flex gap-4">
                                    <span className="text-green-500 font-bold">3.</span>
                                    <span>Can I charge enough to make it worth building?</span>
                                </li>
                            </ol>
                        </div>

                        <p>
                            That tool became FounderOS.
                        </p>

                        <p className="text-xl font-semibold text-[var(--foreground)] pt-8">
                            I used it on my next idea.
                        </p>

                        <p>
                            Validation score: 3.2/10. Market saturated. Low monetization potential.
                        </p>

                        <p>
                            I didn't build it.
                        </p>

                        <p>
                            For the first time in years, I saved myself months of wasted work.
                        </p>

                        <p className="text-xl font-semibold text-[var(--foreground)] pt-8">
                            The next idea scored 8.5/10.
                        </p>

                        <p>
                            I built it in 2 weeks. Launched to 47 signups in the first week.
                        </p>

                        <p>
                            It wasn't luck. It was data.
                        </p>

                        <p className="text-xl font-semibold text-[var(--foreground)] pt-8">
                            I realized I wasn't alone.
                        </p>

                        <p>
                            There are thousands of developers with the same 12-project graveyard.
                        </p>

                        <p>
                            Brilliant builders. Terrible at picking battles.
                        </p>

                        <p>
                            So I opened FounderOS to the world.
                        </p>

                        <p className="text-xl font-semibold text-[var(--foreground)] pt-8">
                            This isn't just a validation tool.
                        </p>

                        <p>
                            It's a philosophy: **Data over intuition. Validation before code.**
                        </p>

                        <p>
                            Your excitement about an idea doesn't matter.
                        </p>

                        <p>
                            Your gut feeling doesn't matter.
                        </p>

                        <p>
                            What matters is: Will people pay for this? Today. Not in your dreams.
                        </p>

                        <p className="text-xl font-semibold text-[var(--foreground)] pt-8">
                            FounderOS exists to stop you from building the wrong thing.
                        </p>

                        <p>
                            Because the world doesn't need more beautiful code in abandoned repositories.
                        </p>

                        <p>
                            It needs profitable businesses that solve real problems.
                        </p>

                        <p className="text-2xl font-bold text-[var(--foreground)] pt-12">
                            Let's build the right things.
                        </p>

                        <p className="text-lg">
                            — The FounderOS Team
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="pt-12 text-center">
                        <Link href="/signup">
                            <button className="bg-[var(--foreground)] text-[var(--background)] px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                Start Validating Your Ideas
                            </button>
                        </Link>
                        <p className="text-sm text-[var(--muted)] mt-4">
                            Don't be the 13th failed project.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
