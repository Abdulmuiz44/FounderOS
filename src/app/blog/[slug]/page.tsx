import { BLOG_POSTS } from '@/lib/blog-data';
import { getPostBySlug } from '@/lib/blog';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Share2, Twitter, Linkedin, Clock, Calendar } from 'lucide-react';
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

export default async function BlogPost({ params }: { params: { slug: string } }) {
    const post = BLOG_POSTS.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    // Try to get markdown content, fallback to generated content
    const mdPost = await getPostBySlug(params.slug);
    const contentHtml = mdPost?.content || `<p>${post.excerpt}</p><p><em>Full content coming soon...</em></p>`;

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <nav className="p-6 md:p-8 flex items-center justify-between max-w-4xl mx-auto backdrop-blur-sm bg-[var(--background)]/80 sticky top-0 z-50">
                <Link href="/blog" className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>
                <span className="font-bold">FounderOS</span>
            </nav>

            <article className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="mb-12 text-center space-y-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-wider">
                        {post.category}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">{post.title}</h1>
                    <div className="text-[var(--muted)] flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <time>{post.date}</time>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{Math.ceil(contentHtml.length / 1000)} min read</span>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-[var(--foreground)] prose-p:text-[var(--muted)] prose-strong:text-[var(--foreground)] prose-li:text-[var(--muted)]"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                />

                {/* CTA */}
                <div className="mt-20 p-8 md:p-12 bg-gradient-to-br from-[var(--foreground)] to-slate-800 text-[var(--background)] rounded-3xl text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Stop guessing. Start Validating.</h3>
                    <p className="mb-8 opacity-90 text-lg relative z-10 max-w-xl mx-auto">
                        The difference between a failed project and a profitable business is data. Get the data you need with FounderOS.
                    </p>
                    <Link href="/signup" className="relative z-10">
                        <button className="bg-[var(--background)] text-[var(--foreground)] px-8 py-4 rounded-full font-bold text-lg hover:bg-[var(--background)]/90 transition-all shadow-xl">
                            Validate Your Idea Free
                        </button>
                    </Link>
                </div>
            </article>

            <Footer />
        </div>
    );
}
