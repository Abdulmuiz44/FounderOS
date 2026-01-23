'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface FounderBrief {
  executive_summary: string;
  key_observations: string[];
  meaning: string;
  founder_focus: string[];
  week_start_date?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [brief, setBrief] = useState<FounderBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('light');
  
  const supabase = createClient();

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Auth check
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) fetchLatestBrief(session.user.id);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchLatestBrief(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });
    if (error) setMessage('Error sending magic link');
    else setMessage('Check your email for the magic link!');
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBrief(null);
  };

  const fetchLatestBrief = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('founder_briefs')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setBrief(data);
    } else {
      // No brief found, maybe generate one? Or let user click refresh.
      setBrief(null);
    }
    setLoading(false);
  };

  const refreshBrief = async () => {
    setLoading(true);
    try {
      // Call API to generate and save
      const res = await fetch('/api/brief'); // This API needs to update DB now too
      if (res.ok) {
        // Wait a bit or re-fetch from DB
        if (user) await fetchLatestBrief(user.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">FounderOS</h1>
            <p className="mt-2 text-gray-500">Sign in to view your briefings</p>
          </div>
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <input
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
            {message && <p className="text-center text-sm text-green-600">{message}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="flex justify-between items-center mb-16">
        <h1 className="text-2xl font-bold tracking-tight">FounderOS</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={handleLogout} className="text-sm font-medium hover:opacity-70">
            Sign Out
          </button>
        </div>
      </header>

      <main className="space-y-12 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {brief?.week_start_date ? `Week of ${brief.week_start_date}` : 'No brief available'}
          </span>
          <button
            onClick={refreshBrief}
            disabled={loading}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Analyzing...' : 'Refresh Brief'}
          </button>
        </div>

        {brief ? (
          <div className="space-y-10">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Executive Summary</h2>
              <p className="text-lg leading-relaxed">{brief.executive_summary}</p>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Key Observations</h2>
              <ul className="space-y-3">
                {brief.key_observations.map((obs, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-3 text-gray-400">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">What This Likely Means</h2>
              <p className="text-lg leading-relaxed">{brief.meaning}</p>
            </section>

            <section className="pt-6 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold mb-6">Founder Focus (Next 7 Days)</h2>
              <ul className="space-y-4">
                {brief.founder_focus.map((focus, i) => (
                  <li key={i} className="flex items-start p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-bold mr-4 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="font-medium">{focus}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
           !loading && <div className="text-center text-gray-500 py-10">Welcome! Click refresh to generate your first brief.</div>
        )}
      </main>
    </div>
  );
}