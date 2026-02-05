import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogPage() {
    const posts = [
        {
            title: "Why most MVPs are too big",
            excerpt: "You don't need authentication, payments, and settings for v1. You need value.",
            date: "Feb 10, 2026",
            readTime: "5 min read",
            slug: "mvp-mistakes"
        },
        {
            title: "The Validation Framework",
            excerpt: "How to know if your idea is worth building in less than 24 hours.",
            date: "Feb 05, 2026",
            readTime: "8 min read",
            slug: "validation-framework"
        },
        {
            title: "Shipping Velocity vs. Code Quality",
            excerpt: "When to write spaghetti code and when to refactor.",
            date: "Jan 28, 2026",
            readTime: "6 min read",
            slug: "velocity-grading"
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-6xl mx-auto">
                <Link href="/" className="font-bold">FounderOS</Link>
                <Link href="/signup" className="text-sm font-medium hover:underline">Get Started</Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">The Builder's Journal</h1>
                <p className="text-xl text-[var(--muted)] mb-16">Thoughts on shipping, validating, and bootstrapping.</p>

                <div className="grid gap-12">
                    {posts.map((post, i) => (
                        <article key={i} className="group cursor-pointer">
                            <div className="flex items-center gap-3 text-sm text-[var(--muted)] mb-3">
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>{post.readTime}</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors">{post.title}</h2>
                            <p className="text-[var(--muted)] mb-4">{post.excerpt}</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-500">
                                Read Article <ArrowRight className="w-4 h-4" />
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
