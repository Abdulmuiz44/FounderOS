'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  ArrowRight,
  Target,
  Hammer,
  CheckCircle,
  Clock,
  Sparkles,
  Loader2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    ideas: 0,
    validated: 0,
    building: 0
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Auth User
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);

      // Fetch Data
      try {
        // Fetch Opportunities (Ideas)
        const oppsRes = await fetch('/api/opportunities');
        const oppsData = await oppsRes.json();
        const opportunities = oppsData.opportunities || [];

        // Fetch Projects (Building)
        const projRes = await fetch('/api/projects');
        const projects = await projRes.json();

        setStats({
          ideas: opportunities.length,
          validated: opportunities.filter((o: any) => o.status === 'VALIDATED' || o.status === 'CONVERTED').length,
          building: projects.length
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-[var(--muted)]" /></div>;

  return (
    <main className="flex-1 overflow-y-auto bg-[var(--background)] p-8">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Hero / Welcome */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-[var(--foreground)]">{user?.name?.split(' ')[0] || 'Founder'}</span>.
          </h1>
          <p className="text-xl text-[var(--muted)] max-w-2xl leading-relaxed">
            Don't just build. <span className="text-[var(--foreground)] font-medium">Validate first.</span><br />
            The goal is to build the <em>right</em> thing that is actually valuable.
          </p>
        </div>

        {/* The Funnel */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-6">Your Founder Funnel</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Stage 1: Ideas */}
            <Link href="/dashboard/opportunities" className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Lightbulb className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-[var(--muted)]">Idea Generation</span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{stats.ideas}</span>
                  <span className="text-sm text-[var(--muted)] ml-2">ideas logged</span>
                </div>
                <div className="text-sm text-[var(--muted)] flex items-center gap-1 group-hover:text-[var(--foreground)] transition-colors">
                  Go to Lab <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>

            {/* Stage 2: Validation */}
            <Link href="/dashboard/opportunities" className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Target className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-[var(--muted)]">Validation</span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{stats.validated}</span>
                  <span className="text-sm text-[var(--muted)] ml-2">ideas verified</span>
                </div>
                <p className="text-xs text-[var(--muted)] mb-4">
                  {stats.ideas > 0 ? Math.round((stats.validated / stats.ideas) * 100) : 0}% validation rate
                </p>
              </motion.div>
            </Link>

            {/* Stage 3: Execution */}
            <Link href="/dashboard/projects" className="group">
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden h-full"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Hammer className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                    <Hammer className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-[var(--muted)]">Execution</span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{stats.building}</span>
                  <span className="text-sm text-[var(--muted)] ml-2">active builds</span>
                </div>
                <div className="text-sm text-[var(--muted)] flex items-center gap-1 group-hover:text-[var(--foreground)] transition-colors">
                  Track Progress <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            </Link>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border border-[var(--border)] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <Sparkles className="w-12 h-12 mx-auto text-purple-500 mb-4" />
            <h2 className="text-2xl font-bold">Have a new spark?</h2>
            <p className="text-[var(--muted)] text-lg">
              Don't start coding yet. Generate a validation plan and check if the market wants it first.
            </p>
            <Link href="/dashboard/opportunities/create">
              <button className="bg-[var(--foreground)] text-[var(--background)] px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg">
                Validate New Idea
              </button>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}