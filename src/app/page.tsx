'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface FounderBrief {
  executive_summary: string;
  key_observations: string[];
  meaning: string;
  founder_focus: string[];
  week_start_date?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [brief, setBrief] = useState<FounderBrief | null>(null);
  const [loading, setLoading] = useState(true); // Initial load is true
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [theme, setTheme] = useState('light');
  
  const supabase = createClient();

  useEffect(() => {
    // Theme initialization
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Auth subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchLatestBrief(session.user.id);
      } else {
        setLoading(false);
      }
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
    setAuthLoading(true);
    setAuthMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}` },
    });
    setAuthLoading(false);
    if (error) setAuthMessage('Unable to send magic link. Please try again.');
    else setAuthMessage('Magic link sent! Check your inbox.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBrief(null);
  };

  const fetchLatestBrief = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('founder_briefs')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single();

    if (data) setBrief(data);
    setLoading(false);
  };

  const generateBrief = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/brief');
      if (!res.ok) throw new Error('Generation failed');
      if (user) await fetchLatestBrief(user.id);
    } catch (err) {
      setError('We encountered an issue analyzing your signals. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // --- Auth Screen ---
  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
        <div className="max-w-sm w-full space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">FounderOS</h1>
            <p className="text-[var(--muted)] text-sm">Your weekly company intelligence briefing.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                placeholder="founder@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11 text-base" 
              isLoading={authLoading}
            >
              Sign In with Email
            </Button>
            {authMessage && (
              <p className={`text-center text-sm ${authMessage.includes('sent') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                {authMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // --- Dashboard ---
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6 py-10">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">FounderOS</span>
            <span className="text-[10px] font-medium bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)]">BETA</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button 
              onClick={handleLogout} 
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Log Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="animate-fade-in">
          <div className="flex justify-between items-end mb-8 border-b border-[var(--border)] pb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Weekly Brief</h2>
              <p className="text-[var(--muted)] text-sm">
                {brief?.week_start_date 
                  ? `Week of ${new Date(brief.week_start_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}` 
                  : loading ? <Skeleton className="w-32 h-4 inline-block" /> : 'No brief generated yet'}
              </p>
            </div>
            <Button 
              onClick={generateBrief} 
              isLoading={generating}
              variant="secondary"
              className="shadow-sm"
            >
              Generate New Brief
            </Button>
          </div>

          {error && (
            <div className="mb-8 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-12">
              <div className="space-y-4">
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-full h-24" />
              </div>
              <div className="space-y-4">
                <Skeleton className="w-40 h-4" />
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-5/6 h-6" />
              </div>
            </div>
          ) : brief ? (
            <div className="space-y-12">
              {/* Executive Summary */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-4">Executive Summary</h3>
                <p className="text-lg leading-relaxed text-[var(--foreground)] font-light">
                  {brief.executive_summary}
                </p>
              </section>

              {/* Key Observations */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-4">Key Observations</h3>
                <ul className="space-y-3">
                  {brief.key_observations.map((obs, i) => (
                    <li key={i} className="flex items-start group">
                      <span className="mr-3 text-[var(--muted)] text-lg leading-none mt-1 group-hover:text-[var(--accent)] transition-colors">•</span>
                      <span className="text-[var(--foreground)] leading-relaxed">{obs}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Meaning */}
              <section className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Strategic Implication</h3>
                <p className="text-base leading-relaxed text-[var(--foreground)] opacity-90">
                  {brief.meaning}
                </p>
              </section>

              {/* Founder Focus */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-6">Founder Priorities (Next 7 Days)</h3>
                <div className="grid gap-4">
                  {brief.founder_focus.map((focus, i) => (
                    <div key={i} className="flex items-start p-4 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] transition-colors bg-[var(--background)] hover:shadow-sm">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold mr-4 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="font-medium text-[var(--foreground)]">{focus}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="text-center py-24 bg-[var(--card)] rounded-xl border border-[var(--border)] border-dashed">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="text-4xl">📊</div>
                <h3 className="text-lg font-medium text-[var(--foreground)]">No Briefs Yet</h3>
                <p className="text-[var(--muted)] text-sm">
                  Generate your first Founder Brief to get a snapshot of your SaaS metrics and strategic priorities.
                </p>
                <Button onClick={generateBrief} isLoading={generating} className="mt-4">
                  Generate First Brief
                </Button>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-24 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted)]">
            &copy; {new Date().getFullYear()} FounderOS. Confidential & Private.
          </p>
        </footer>
      </div>
    </div>
  );
}
