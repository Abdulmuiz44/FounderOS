'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getNextBriefDate, daysAgo } from '@/utils/date';

interface FounderBrief {
  id: string;
  executive_summary: string;
  key_observations: string[];
  meaning: string;
  founder_focus: string[];
  week_start_date: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [briefs, setBriefs] = useState<FounderBrief[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<FounderBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [theme, setTheme] = useState('light');
  
  const supabase = createClient();

  useEffect(() => {
    // Theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchBriefs(session.user.id);
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
    if (error) setAuthMessage('Unable to send magic link.');
    else setAuthMessage('Magic link sent! Check your inbox.');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setBriefs([]);
    setSelectedBrief(null);
  };

  const fetchBriefs = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('founder_briefs')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(10); // History limit

    if (data && data.length > 0) {
      setBriefs(data);
      setSelectedBrief(data[0]);
    }
    setLoading(false);
  };

  const generateBrief = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/brief');
      if (!res.ok) throw new Error('Generation failed');
      if (user) await fetchBriefs(user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Helper to determine sentiment tag
  const getBriefSentiment = (summary: string) => {
    const text = summary.toLowerCase();
    if (text.includes('growth') || text.includes('surge') || text.includes('opportunity')) return 'positive';
    if (text.includes('risk') || text.includes('drop') || text.includes('decline') || text.includes('stall')) return 'concern';
    return 'mixed';
  };

  const SentimentBadge = ({ type }: { type: string }) => {
    const styles = {
      positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      concern: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      mixed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    };
    const labels = { positive: 'Momentum', concern: 'Attention Needed', mixed: 'Stable' };
    
    return (
      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider ${styles[type as keyof typeof styles]}`}>
        {labels[type as keyof typeof labels] || 'Update'}
      </span>
    );
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
        <div className="max-w-sm w-full space-y-8 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">FounderOS</h1>
            <p className="text-[var(--muted)] text-sm">Your weekly company intelligence briefing.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--accent)] transition-all outline-none"
              placeholder="founder@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full" isLoading={authLoading}>Sign In with Email</Button>
            {authMessage && <p className="text-center text-sm text-[var(--muted)]">{authMessage}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold tracking-tight">FounderOS</h1>
              <span className="text-[10px] font-bold bg-[var(--card)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--muted)] tracking-wider">BETA</span>
            </div>
            <p className="text-[var(--muted)] text-sm">Your weekly company intelligence briefing.</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)]">Next Automated Brief</p>
                <p className="text-xs font-medium text-[var(--foreground)]">
                  {getNextBriefDate().toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
                </p>
             </div>
             <div className="h-8 w-px bg-[var(--border)] hidden md:block"></div>
            <button onClick={toggleTheme} className="p-2 rounded-full text-[var(--muted)] hover:bg-[var(--card)]">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button onClick={handleLogout} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]">
              Sign Out
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-12 gap-12 animate-fade-in">
          
          {/* Sidebar Timeline */}
          <aside className="md:col-span-3 space-y-8">
            <div className="flex justify-between items-center md:hidden">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Brief History</h2>
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Timeline</span>
                  <Button 
                    onClick={generateBrief} 
                    isLoading={generating} 
                    variant="ghost" 
                    className="h-6 text-xs px-2 -mr-2"
                  >
                    + New
                  </Button>
               </div>

              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="w-full h-16" />
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-12" />
                </div>
              ) : briefs.length > 0 ? (
                briefs.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrief(b)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${
                      selectedBrief?.id === b.id
                        ? 'bg-[var(--card)] border-[var(--border)] shadow-sm'
                        : 'border-transparent hover:bg-[var(--card)] hover:border-[var(--border)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-medium text-[var(--muted)]">
                        {new Date(b.week_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {selectedBrief?.id === b.id && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>}
                    </div>
                    <p className={`text-sm font-medium line-clamp-2 ${selectedBrief?.id === b.id ? 'text-[var(--foreground)]' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]'}`}>
                      {getBriefSentiment(b.executive_summary) === 'positive' ? '🚀 Momentum' : getBriefSentiment(b.executive_summary) === 'concern' ? '⚠️ Attention' : '📊 Update'}
                    </p>
                  </button>
                ))
              ) : (
                 <div className="text-sm text-[var(--muted)] italic py-4">No briefs yet.</div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-9 min-h-[500px]">
            {selectedBrief ? (
              <div className="space-y-12 animate-fade-in">
                
                {/* Meta Header */}
                <div className="flex justify-between items-end border-b border-[var(--border)] pb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-2xl font-semibold text-[var(--foreground)]">Weekly Intelligence</h2>
                       <SentimentBadge type={getBriefSentiment(selectedBrief.executive_summary)} />
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      Generated {daysAgo(selectedBrief.created_at)} • Week of {new Date(selectedBrief.week_start_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="hidden md:block">
                     {/* Actions could go here */}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-10">
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Executive Summary</h3>
                    <p className="text-lg leading-relaxed text-[var(--foreground)]">
                      {selectedBrief.executive_summary}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Signals & Observations</h3>
                    <ul className="space-y-3">
                      {selectedBrief.key_observations.map((obs, i) => (
                        <li key={i} className="flex items-start">
                          <span className="mr-3 text-[var(--muted)] mt-1.5 text-[10px]">•</span>
                          <span className="text-[var(--foreground)] leading-relaxed opacity-90">{obs}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Strategic Implication</h3>
                    <p className="text-base leading-relaxed text-[var(--foreground)]">
                      {selectedBrief.meaning}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-5">Founder Focus</h3>
                    <div className="grid gap-4">
                      {selectedBrief.founder_focus.map((focus, i) => (
                        <div key={i} className="flex items-start p-4 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-[10px] font-bold mr-4 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="font-medium text-[var(--foreground)] text-sm">{focus}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[var(--card)] rounded-xl border border-[var(--border)] border-dashed opacity-70">
                 <div className="mb-4 text-3xl opacity-50">✨</div>
                 <h3 className="text-lg font-medium text-[var(--foreground)]">Welcome to FounderOS</h3>
                 <p className="text-[var(--muted)] text-sm max-w-sm mt-2 mb-6">
                   Your quiet weekly conversation with your business. Connect your data to generate your first intelligence briefing.
                 </p>
                 <Button onClick={generateBrief} isLoading={generating}>
                   Generate First Brief
                 </Button>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}