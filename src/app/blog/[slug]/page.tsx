import { BLOG_POSTS } from '@/lib/blog-data';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Share2, Twitter, Linkedin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = BLOG_POSTS.find(p => p.slug === params.slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | FounderOS Blog`,
        description: post.excerpt,
        keywords: post.keywords
    };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
    const post = BLOG_POSTS.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-4xl mx-auto">
                <Link href="/blog" className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>
                <span className="font-bold">FounderOS</span>
            </nav>

            <article className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-[var(--muted)]/10 text-[var(--foreground)] text-sm font-medium mb-6">
                        {post.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>
                    <div className="text-[var(--muted)] flex items-center justify-center gap-4">
                        <time>{post.date}</time>
                        <span>•</span>
                        <span>10 min read</span>
                    </div>
                </header>

                {/* Content Body - Simulated pSEO content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="lead text-xl text-[var(--foreground)] font-serif italic mb-8 border-l-4 border-blue-500 pl-4">
                        {post.excerpt}
                    </p>

                    <h2>Introduction</h2>
                    <p>
                        So you want to know about <strong>{post.keywords[0]}</strong>? You are not alone. Thousands of founders are waking up to the reality that {post.category.toLowerCase()} is the bottleneck between them and freedom.
                    </p>
                    <p>
                        In this deep dive, we are going to explore why {post.title.toLowerCase()} is crucial for your success in 2026.
                    </p>

                    <h2>The Truth About {post.keywords[1]}</h2>
                    <p>
                        Most people approach <strong>{post.keywords[1]}</strong> completely backwards. They look at what others are doing and copy it. But as we say at FounderOS: "Differentiation is the only defense."
                    </p>

                    <div className="my-8 p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl">
                        <h3 className="text-lg font-bold mb-2">Key Takeaway</h3>
                        <p className="m-0">
                            Stop trying to be better. Try to be different. The market for <strong>{post.keywords[2]}</strong> is crowded, but the market for <em>verified solutions</em> is empty.
                        </p>
                    </div>

                    <h2>Step 1: Understand the Data</h2>
                    <p>
                        Before you take action, look at the numbers. Recent trends in <strong>{post.keywords[3] || 'the market'}</strong> suggest a massive shift towards AI-native workflows. If you are not leveraging this, you are building for a world that no longer exists.
                    </p>

                    <h2>Step 2: Execution Strategy</h2>
                    <ul>
                        <li><strong>Define your niche</strong> down to the smallest viable audience.</li>
                        <li><strong>Validate early</strong> using tools like FounderOS (shameless plug, but it works).</li>
                        <li><strong>Ship fast</strong>, but only after you have confirmed intent.</li>
                    </ul>

                    <h2>Conclusion</h2>
                    <p>
                        Building a startup is hard. But it is harder when you are blind. Use the strategies outlined here to master <strong>{post.keywords[0]}</strong> and stop wasting time.
                    </p>
                </div>

                {/* CTA */}
                <div className="mt-16 p-8 md:p-12 bg-[var(--foreground)] text-[var(--background)] rounded-3xl text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to validate your next big idea?</h3>
                    <p className="mb-8 opacity-90 text-lg">
                        Don't leave your success up to chance. Use FounderOS to analyze markets, spies on competitors, and validate ideas instantly.
                    </p>
                    <Link href="/signup">
                        <button className="bg-[var(--background)] text-[var(--foreground)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--background)]/90 transition-all">
                            Start Free Trial
                        </button>
                    </Link>
                </div>
            </article>

            <Footer />
        </div>
    );
}
