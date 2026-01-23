'use client';

import { useState, useEffect } from 'react';

interface FounderBrief {
  executiveSummary: string;
  keyObservations: string[];
  meaning: string;
  founderFocus: string[];
}

export default function Home() {
  const [brief, setBrief] = useState<FounderBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Initial theme setup
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    fetchBrief();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const fetchBrief = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/brief');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setBrief(data);
    } catch (err) {
      setError('Could not generate brief. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="flex justify-between items-center mb-16">
        <h1 className="text-2xl font-bold tracking-tight">FounderOS</h1>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="space-y-12 animate-in fade-in duration-500">
        <div className="flex justify-end">
          <button
            onClick={fetchBrief}
            disabled={loading}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Analyzing Signals...' : 'Refresh Brief'}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {brief && !loading && (
          <div className="space-y-10">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Executive Summary</h2>
              <p className="text-lg leading-relaxed">{brief.executiveSummary}</p>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Key Observations</h2>
              <ul className="space-y-3">
                {brief.keyObservations.map((obs, i) => (
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
                {brief.founderFocus.map((focus, i) => (
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
        )}

        {loading && !brief && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Processing business signals...</p>
          </div>
        )}
      </main>

      <footer className="mt-24 pt-8 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
        <p>FounderOS v1.0 • Automated Intelligence</p>
      </footer>
    </div>
  );
}
