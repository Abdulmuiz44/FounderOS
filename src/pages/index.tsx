import { useState, useEffect } from 'react';
import Head from 'next/head';

interface FounderBrief {
  executiveSummary: string;
  keyObservations: string[];
  meaning: string;
  founderFocus: string[];
}

export default function Home() {
  const [brief, setBrief] = useState<FounderBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  const fetchBrief = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/brief');
      const data = await res.json();
      setBrief(data);
    } catch (error) {
      console.error('Failed to fetch brief', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrief();
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#121212] text-[#e0e0e0]' : 'bg-white text-gray-900'}`}>
      <Head>
        <title>FounderOS Brief</title>
        <meta name="description" content="Automated Founder Brief" />
      </Head>

      <div className="container mx-auto max-w-2xl px-6 py-12">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight">FounderOS</h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            aria-label="Toggle Theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <main>
          <div className="flex justify-end mb-6">
             <button
              onClick={fetchBrief}
              disabled={loading}
              className={`text-sm px-4 py-2 rounded-md font-medium transition-colors ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-800' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200'
              }`}
            >
              {loading ? 'Generating...' : 'Refresh Brief'}
            </button>
          </div>

          {brief ? (
            <div className="space-y-10 animate-fade-in">
              <section>
                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Executive Summary</h2>
                <p className="text-lg leading-relaxed">{brief.executiveSummary}</p>
              </section>

              <section>
                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Key Observations</h2>
                <ul className="space-y-2">
                  {brief.keyObservations.map((obs, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>What This Likely Means</h2>
                <p className="text-lg leading-relaxed">{brief.meaning}</p>
              </section>

              <section className={`p-6 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                <h2 className="text-xl font-semibold mb-4 text-blue-500">Founder Focus (Next 7 Days)</h2>
                <ul className="space-y-4">
                  {brief.founderFocus.map((focus, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold mr-3 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Analyzing signals...</p>
            </div>
          )}
        </main>

        <footer className={`mt-20 pt-6 border-t text-center text-sm ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400'}`}>
          FounderOS v1.0
        </footer>
      </div>
    </div>
  );
}
