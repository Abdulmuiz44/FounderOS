'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Footer } from '@/components/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Target,
  BarChart3,
  GitCommit,
  XCircle,
  Search,
  Zap,
  Shield
} from 'lucide-react';

// Separate component for handling auth code
function AuthCodeHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      router.push(`/auth/callback?code=${code}`);
    }
  }, [searchParams, router]);

  return null;
}

export default function Landing() {
  const [stats, setStats] = useState({
    users: 0,
    logs: 0,
    projects: 0
  });

  const [graphData, setGraphData] = useState<Array<{ active: boolean; height: number }>>([]);

  useEffect(() => {
    setGraphData(Array(20).fill(0).map(() => ({
      active: Math.random() > 0.5,
      height: Math.random() * 100
    })));
  }, []);

  // Fetch real-time stats (keeping existing logic)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format number
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return num > 0 ? `${num}+` : '0';
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--foreground)] selection:text-[var(--background)] overflow-hidden font-sans">
      {/* Handle auth code redirect */}
      <Suspense fallback={null}>
        <AuthCodeHandler />
      </Suspense>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-6xl mx-auto w-full z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]/50 md:border-transparent transition-all">
        <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <img src="/logo.svg" alt="FounderOS Logo" className="w-full h-full object-cover" />
          </div>
          FounderOS
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">See How It Works</Link>
          <Link href="/pricing" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors hidden sm:block">
            Log In
          </Link>
          <Link href="/signup">
            <Button variant="primary" className="h-10 px-5 text-sm font-semibold shadow-lg shadow-blue-500/20">Start Free Trial</Button>
          </Link>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={stagger}
          className="pt-40 pb-20 md:pt-52 md:pb-32 px-6 max-w-5xl mx-auto text-center space-y-8 relative"
        >
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 opacity-50 dark:opacity-20 pointer-events-none" />

          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] rounded-full px-4 py-1.5 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-[var(--muted)]">New: Find ideas people will actually pay for</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]">
            Stop guessing.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Build what customers already want.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-[var(--muted)] font-light leading-relaxed max-w-3xl mx-auto">
            FounderOS helps you pick a winner before you write code. Discover painful problems, validate demand with evidence, and launch with confidence—not hope.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup">
              <Button className="h-14 px-8 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--foreground)]/90">
                Get My First Validation Report <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="secondary" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--secondary)]">
                See How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div variants={fadeInUp} className="pt-16 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-2xl mx-auto opacity-70">
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums">{formatNumber(stats.users)}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Founders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums">{formatNumber(stats.projects)}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Ideas Validated</p>
            </div>
            <div className="text-center hidden md:block">
              <p className="text-3xl font-bold tabular-nums">{formatNumber(stats.logs)}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Build Logs</p>
            </div>
          </motion.div>
        </motion.section>

        {/* The Problem: The "Build Trap" */}
        <section className="py-24 px-6 bg-[var(--card)] border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">The Cost of Guessing</h2>
                <h3 className="text-3xl md:text-5xl font-bold leading-tight">Most founders lose months <br />building products nobody buys.</h3>
                <p className="text-lg text-[var(--muted)]">
                  The pattern is brutal: idea excitement, weeks of building, then silence at launch. Validation first flips that outcome.
                </p>
                <ul className="space-y-4 pt-4">
                  {[
                    "Building features no buyer asked for",
                    "Chasing problems people won't pay to solve",
                    "Burning 100+ hours before proving demand",
                    "Burnout from effort that never converts"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[var(--foreground)]">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                {/* Visual representation of 'Building in Dark' vs 'Clarity' */}
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                  <div className="space-y-6 relative z-10">
                    <div className="flex gap-4 items-center opacity-40 grayscale">
                      <div className="w-10 h-10 rounded-full bg-[var(--muted)]/20 flex items-center justify-center">1</div>
                      <div className="flex-1 h-3 bg-[var(--muted)]/20 rounded"></div>
                    </div>
                    <div className="flex gap-4 items-center opacity-40 grayscale">
                      <div className="w-10 h-10 rounded-full bg-[var(--muted)]/20 flex items-center justify-center">2</div>
                      <div className="flex-1 h-3 bg-[var(--muted)]/20 rounded"></div>
                    </div>

                    {/* The Warning Card */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 transform rotate-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-bold text-red-500">Validation Missing</span>
                      </div>
                      <p className="text-lg font-bold">&quot;Is this worth building?&quot;</p>
                      <p className="text-sm opacity-70 mt-1">Market demand unclear. Competitor analysis missing. monetization strategy undefined.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Solution: High Level Workflow */}
        <section id="how-it-works" className="py-32 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-4">Your Faster Path to Revenue</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">From raw idea to first paying customers.<br />Without gambling months.</h3>
            <p className="text-lg text-[var(--muted)]">
              A simple decision system that helps you focus on ideas with clear demand, clear buyers, and clear monetization.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-green-500/20 z-0"></div>

            {/* Step 1: Generate */}
            <div className="relative z-10 bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">1. Generate</h4>
              <p className="text-[var(--muted)] mb-4 leading-relaxed">
                Start with ideas matched to your strengths and real market pain—so you begin with leverage instead of random brainstorming.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> High-intent niche selection</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Problem-first idea framing</li>
              </ul>
            </div>

            {/* Step 2: Validate */}
            <div className="relative z-10 bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all group ring-2 ring-violet-500/20">
              <div className="w-16 h-16 bg-violet-500/10 text-violet-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8" />
              </div>
              <div className="absolute top-4 right-4 bg-violet-500 text-white text-[10px] font-bold px-2 py-1 rounded">CORE</div>
              <h4 className="text-xl font-bold mb-3">2. Validate</h4>
              <p className="text-[var(--muted)] mb-4 leading-relaxed">
                Before building, get a <strong className="text-violet-500">buy-signal score</strong>. FounderOS checks demand, competitors, and willingness-to-pay so you know what to pursue—and what to drop.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500" /> Demand and competitor proof</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500" /> Pricing and monetization clarity</li>
              </ul>
            </div>

            {/* Step 3: Execute */}
            <div className="relative z-10 bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] shadow-lg hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GitCommit className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-3">3. Execute</h4>
              <p className="text-[var(--muted)] mb-4 leading-relaxed">
                When an idea is validated, move into execution with clear milestones and momentum tracking so shipping turns into traction.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Execution accountability</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Momentum + shipping consistency</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Deep Dive Features */}
        <section id="features" className="py-24 bg-[var(--card)] border-y border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
              <div className="order-2 md:order-1 relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-[100px] rounded-full opacity-30"></div>
                <div className="rounded-2xl overflow-hidden shadow-2xl relative border border-[var(--border)]">
                  <img
                    src="/images/visuals/validation-dashboard.png"
                    alt="FounderOS Validation Dashboard showing 8.5/10 score"
                    className="w-full h-auto"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold">Know it can sell before you build.</h3>
                <p className="text-lg text-[var(--muted)]">
                  Get a practical go/no-go decision backed by market evidence, competitive gaps, and monetization signals—so you only build ideas with upside.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="border-l-2 border-violet-500 pl-4">
                    <p className="font-bold text-lg">Market</p>
                    <p className="text-sm text-[var(--muted)]">Buyer demand</p>
                  </div>
                  <div className="border-l-2 border-violet-500 pl-4">
                    <p className="font-bold text-lg">Competition</p>
                    <p className="text-sm text-[var(--muted)]">Positioning gaps</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold">Ship faster, with less second-guessing.</h3>
                <p className="text-lg text-[var(--muted)]">
                  Turn validated ideas into shipped features. FounderOS keeps your execution visible so your plan becomes progress every week.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Automatic progress tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Daily shipped evidence</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Consistency streaks</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full opacity-30"></div>
                <div className="rounded-2xl overflow-hidden shadow-2xl relative border border-[var(--border)]">
                  <img
                    src="/images/visuals/github-tracking.png"
                    alt="FounderOS GitHub Activity Tracking with 12 day streak and 48 commits"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto rounded-3xl p-12 md:p-20 text-center relative overflow-hidden ring-1 ring-white/10"
          >
            {/* Dark/Light mode compatible background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black dark:from-indigo-950/50 dark:via-purple-950/30 dark:to-black z-0"></div>

            {/* Mesh gradient overlay */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 mix-blend-overlay"></div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10 text-white dark:text-gray-100">Validate once. Build with conviction.</h2>
            <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto relative z-10 text-gray-300 dark:text-gray-300">
              Join {stats.users > 0 ? formatNumber(stats.users) : 'hundreds of'} founders using FounderOS to avoid dead-end builds and find ideas worth shipping.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link href="/signup">
                <Button className="h-14 px-10 text-lg bg-white text-black hover:bg-white/90 border-0 rounded-full shadow-xl hover:shadow-2xl transition-all font-semibold">
                  Start Free and Validate Your First Idea
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="h-14 px-10 text-lg border-white/20 text-white hover:bg-white/10 hover:text-white rounded-full bg-transparent">
                  View Pricing
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm opacity-50 relative z-10 text-gray-400">No credit card required • Get your first go/no-go decision fast</p>
          </motion.div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
