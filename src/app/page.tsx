// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Footer } from '@/components/Footer';
import {
  ArrowRight,
  Activity,
  Target,
  TrendingUp,
  Sparkles,
  GitCommit,
  Shield,
  Clock,
  CheckCircle2,
  Brain,
  BarChart3,
  AlertTriangle,
  Zap,
  FileText,
  Eye,
  Lightbulb,
  Play
} from 'lucide-react';

export default function Landing() {
  const [stats, setStats] = useState({
    users: 0,
    logs: 0,
    projects: 0
  });

  // Fetch real-time stats from Supabase
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
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  };

  const stagger = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  // Format number with + suffix for display
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return num > 0 ? `${num}+` : '0';
  };

  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--foreground)] selection:text-[var(--background)] overflow-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center max-w-5xl mx-auto w-full z-50 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)]/50 md:border-transparent">
        <span className="font-bold text-lg tracking-tight">FounderOS</span>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Log In
          </Link>
          <Link href="/signup">
            <Button variant="primary" className="h-9 text-xs px-4">Start Free Trial</Button>
          </Link>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>

        {/* Hero Section - Problem + Solution */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={stagger}
          className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 max-w-5xl mx-auto text-center space-y-8"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">7-Day Free Trial • No Credit Card Required</span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Stop wondering where
            <br />
            <span className="text-[var(--muted)]">your time goes.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-lg md:text-xl text-[var(--muted)] font-light leading-relaxed max-w-2xl mx-auto">
            FounderOS automatically tracks your building activity, detects productivity patterns, and shows you <strong className="text-[var(--foreground)]">exactly what's working</strong> — so you can ship faster.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/signup">
              <Button className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                Start Building Smarter <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <span className="text-sm text-[var(--muted)]">Free for 7 days, then $12/mo</span>
          </motion.div>
        </motion.section>

        {/* Social Proof Bar - Live Stats */}
        <section className="py-8 border-y border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{formatNumber(stats.users)}</p>
              <p className="text-xs text-[var(--muted)]">Solo Founders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{formatNumber(stats.logs)}</p>
              <p className="text-xs text-[var(--muted)]">Logs Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums">{formatNumber(stats.projects)}</p>
              <p className="text-xs text-[var(--muted)]">Projects Created</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-green-500 font-medium">Live</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-24 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4">The Problem</h2>
            <p className="text-3xl md:text-4xl font-bold mb-6">You're working hard but not seeing results.</p>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Sound familiar? You spend hours "building" but can't point to what you shipped. You're stuck in planning loops. You don't know if you're making progress.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: AlertTriangle, title: "Planning Paralysis", desc: "You plan the perfect feature, then replan, then plan again... but never ship." },
              { icon: Clock, title: "Time Blindness", desc: "Hours disappear into 'research' and 'tweaking'. You can't account for where your time went." },
              { icon: Activity, title: "Invisible Burnout", desc: "You're exhausted but the progress doesn't match. Are you even moving forward?" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-red-500/5 border border-red-500/20 rounded-xl p-6"
              >
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--muted)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-24 px-6 bg-[var(--card)] border-y border-[var(--border)]">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-green-500 mb-4">The Solution</h2>
            <p className="text-3xl md:text-4xl font-bold mb-6">FounderOS: Your personal productivity mirror.</p>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              See exactly what you're doing, identify your patterns, and optimize your building process with AI-powered insights.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
            >
              {/* Mock Dashboard Header */}
              <div className="border-b border-[var(--border)] p-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="flex-1 bg-[var(--card)] rounded-lg h-6 max-w-md mx-auto flex items-center justify-center">
                  <span className="text-xs text-[var(--muted)]">app.founderos.io/dashboard</span>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6 md:p-8 grid md:grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="md:col-span-3 space-y-4">
                  <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
                    <p className="text-xs font-bold text-[var(--muted)] mb-3">YOUR PROJECTS</p>
                    <div className="space-y-2">
                      <div className="bg-[var(--foreground)]/10 rounded px-3 py-2 text-sm font-medium">🚀 My SaaS App</div>
                      <div className="rounded px-3 py-2 text-sm text-[var(--muted)]">📱 Side Project</div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="md:col-span-9 space-y-6">
                  {/* Insight Card */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-bold text-purple-500">AI INSIGHT</span>
                    </div>
                    <p className="text-lg font-medium">"You've shipped 3 features this week, up from 1 last week. Your momentum is building — keep this streak going!"</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Builder Mode", value: "Deep Focus", color: "text-blue-500" },
                      { label: "This Week", value: "23 logs", color: "text-green-500" },
                      { label: "Chatter Ratio", value: "32%", color: "text-yellow-500" },
                      { label: "System Drift", value: "Stable", color: "text-green-500" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase">{stat.label}</p>
                        <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Logs */}
                  <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)]">
                    <p className="text-xs font-bold text-[var(--muted)] mb-4">RECENT ACTIVITY</p>
                    <div className="space-y-3">
                      {[
                        { type: "update", text: "Shipped the new onboarding flow ✅", time: "2h ago" },
                        { type: "learning", text: "Realized I was overcomplicating auth", time: "5h ago" },
                        { type: "blocker", text: "Stuck on payment integration", time: "Yesterday" }
                      ].map((log, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${log.type === 'update' ? 'bg-[var(--foreground)]' : log.type === 'learning' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                          <div className="flex-1">
                            <p>{log.text}</p>
                            <p className="text-xs text-[var(--muted)]">{log.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works - Step by Step */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">How It Works</h2>
            <p className="text-3xl md:text-4xl font-bold">Three simple steps to clarity.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: FileText,
                title: "Log Your Progress",
                desc: "Take 30 seconds to log what you worked on, what you learned, or what's blocking you. It's like a developer journal, but smarter.",
                visual: (
                  <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] mt-4">
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 bg-[var(--foreground)] text-[var(--background)] rounded text-xs">update</span>
                      <span className="px-2 py-1 border border-[var(--border)] rounded text-xs text-[var(--muted)]">learning</span>
                      <span className="px-2 py-1 border border-[var(--border)] rounded text-xs text-[var(--muted)]">blocker</span>
                    </div>
                    <div className="bg-[var(--background)] rounded p-3 text-sm text-[var(--muted)]">
                      Finally got Stripe webhooks working after 3 hours of debugging...
                    </div>
                  </div>
                )
              },
              {
                step: "2",
                icon: Brain,
                title: "AI Detects Patterns",
                desc: "Our AI analyzes your logs over time and identifies patterns in your work — momentum streaks, focus areas, and friction points.",
                visual: (
                  <div className="bg-[var(--card)] rounded-lg p-4 border border-[var(--border)] mt-4 space-y-3">
                    {[
                      { pattern: "Momentum Streak", confidence: "92%", color: "bg-green-500" },
                      { pattern: "Deep Focus Mode", confidence: "87%", color: "bg-blue-500" },
                      { pattern: "Planning Loop", confidence: "23%", color: "bg-red-500" }
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{p.pattern}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-[var(--background)] rounded-full overflow-hidden">
                            <div className={`h-full ${p.color}`} style={{ width: p.confidence }}></div>
                          </div>
                          <span className="text-xs text-[var(--muted)]">{p.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              },
              {
                step: "3",
                icon: Lightbulb,
                title: "Get Actionable Insights",
                desc: "Receive personalized insights that help you understand your work style and improve your execution over time.",
                visual: (
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-purple-500" />
                      <span className="text-xs font-bold text-purple-500">INSIGHT</span>
                    </div>
                    <p className="text-sm">"You're most productive between 9-11 AM. Consider scheduling deep work during this window."</p>
                  </div>
                )
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center md:text-left"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--foreground)] text-[var(--background)] text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-[var(--muted)] text-sm">{item.desc}</p>
                {item.visual}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Deep Dive */}
        <section className="py-24 px-6 bg-[var(--card)] border-y border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Features</h2>
              <p className="text-3xl md:text-4xl font-bold">Everything you need to build smarter.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: BarChart3,
                  title: "Chatter Ratio",
                  desc: "Are you shipping or just talking? Track how much of your AI interaction actually translates into shipped code.",
                  highlight: "Know if you're executing or overthinking."
                },
                {
                  icon: Activity,
                  title: "System Drift Detection",
                  desc: "Get alerted when you're veering off your goals. Catch momentum decay before you even feel it.",
                  highlight: "Stay on track automatically."
                },
                {
                  icon: Target,
                  title: "Builder Profile",
                  desc: "Understand your unique working style — your focus patterns, friction points, and optimal conditions.",
                  highlight: "Know yourself as a builder."
                },
                {
                  icon: Sparkles,
                  title: "AI Insights",
                  desc: "Receive personalized recommendations based on your actual work patterns, not generic productivity advice.",
                  highlight: "Actionable, not generic."
                },
                {
                  icon: GitCommit,
                  title: "Timeline History",
                  desc: "Look back at your journey. See how you've evolved as a builder over weeks and months.",
                  highlight: "Your building story, visualized."
                },
                {
                  icon: Shield,
                  title: "Privacy First",
                  desc: "Your logs are yours. We never use your data to train models. Everything is encrypted and secure.",
                  highlight: "Your data stays yours."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[var(--background)] border border-[var(--border)] p-8 rounded-2xl"
                >
                  <div className="w-12 h-12 bg-[var(--card)] rounded-lg flex items-center justify-center border border-[var(--border)] mb-6">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-[var(--muted)] text-sm mb-4">{feature.desc}</p>
                  <p className="text-sm font-medium text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {feature.highlight}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Testimonials</h2>
            <p className="text-3xl md:text-4xl font-bold">Loved by solo founders.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Alex K.", role: "Building AI CRM", quote: "I thought I was shipping, but FounderOS showed me I was just planning. The 'Preparation Loop' pattern was a wake-up call. Now I actually ship.", stars: 5 },
              { name: "Sarah J.", role: "Indie Hacker", quote: "The System Drift feature is scary good. It caught my momentum decay three days before I even felt it. Essential for solo founders.", stars: 5 },
              { name: "Mike R.", role: "AI Builder", quote: "Finally, a tool that's not about useless charts. It's a mirror for my execution. I've 2x'd my shipping speed since using it.", stars: 5 }
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-lg mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--foreground)] to-[var(--muted)] rounded-full"></div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-[var(--muted)]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              { q: "What exactly is FounderOS?", a: "FounderOS is a productivity system for solo founders. You log your daily progress (updates, learnings, blockers), and our AI analyzes your patterns to give you insights about how you work and how to improve." },
              { q: "How is this different from a to-do app?", a: "To-do apps track what you plan to do. FounderOS tracks what you actually do. It's about understanding your real behavior, not your intentions." },
              { q: "How long does it take to see results?", a: "Most users see their first meaningful insights within 1-2 weeks of consistent logging. The more you log, the smarter the insights become." },
              { q: "Is there a free trial?", a: "Yes! You get 7 days completely free. No credit card required to start. Try it risk-free." },
              { q: "Is my data private?", a: "Absolutely. Your logs are encrypted, never shared, and never used to train AI models. You can export or delete your data anytime." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel with one click from your settings. No questions asked, no hoops to jump through." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border-b border-[var(--border)] pb-6"
              >
                <h3 className="font-bold mb-2 text-lg">{item.q}</h3>
                <p className="text-[var(--muted)]">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 text-center space-y-8 bg-gradient-to-b from-[var(--card)] to-[var(--background)] border-t border-[var(--border)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto px-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to build smarter?</h2>
            <p className="text-xl text-[var(--muted)] mb-8">
              Join {stats.users > 0 ? formatNumber(stats.users) : ''} founders who've transformed their building process. Start your free trial today.
            </p>
            <Link href="/signup">
              <Button className="h-14 px-12 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all">
                Start 7-Day Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Cancel anytime</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Full access for 7 days</span>
            </div>
          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
