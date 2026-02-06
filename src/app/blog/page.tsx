import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog-data';

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-6xl mx-auto">
                <Link href="/" className="font-bold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                        <img src="/logo.svg" alt="FounderOS Logo" className="w-full h-full object-cover" />
                    </div>
                    FounderOS
                </Link>
                <Link href="/signup" className="text-sm font-medium hover:underline">Get Started</Link>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="space-y-4 mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">The Builder's Journal</h1>
                    <p className="text-xl text-[var(--muted)] max-w-2xl">
                        Tactical guides on validation, shipping, and psychology for the modern solo founder.
                    </p>
                </div>

                <div className="grid gap-8">
                    {BLOG_POSTS.map((post, i) => (
                        <Link href={`/blog/${post.slug}`} key={i} className="group">
                            <article className="p-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-[var(--foreground)]/20 hover:shadow-lg transition-all">
                                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)] mb-4">
                                    <span className="px-2 py-1 rounded bg-[var(--muted)]/10 font-medium text-[var(--foreground)]">
                                        {post.category}
                                    </span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                </div>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-500 transition-colors w-fit">
                                    {post.title}
                                </h2>
                                <p className="text-[var(--muted)] mb-6 text-lg leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
                                    Read Article <ArrowRight className="w-4 h-4" />
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}
