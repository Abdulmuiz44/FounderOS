'use client';

import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const errorParam = searchParams.get('error');
  const successMessage = searchParams.get('success');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Explicitly verify/fetch from public.users as requested
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError && !profile) {
          console.warn("User authenticated but public profile missing:", profileError);
          // Optional: Could trigger a profile creation here if missing
        } else {
          console.log("Login successful. Public profile verified:", profile);
        }

        router.refresh(); // Refresh server components
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="space-y-4 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <img src="/logo.svg" alt="FounderOS Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-xl tracking-tight">FounderOS</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-[var(--muted)]">Sign in to continue building your empire.</p>
          </div>

          <div className="space-y-4">
            {successMessage && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {successMessage === 'EmailVerified' ? 'Email verified! Please log in.' : 'Registration successful!'}
              </div>
            )}

            {errorParam && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorParam === 'OAuthAccountNotLinked'
                  ? 'Email already in use with another provider.'
                  : 'Authentication failed. Please try again.'}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)] transition-all outline-none text-sm"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-[var(--muted)]">Password</label>
                    <Link href="#" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">Forgot password?</Link>
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)] transition-all outline-none text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" isLoading={loading}>
                Sign In
              </Button>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
        <div className="p-4 bg-[var(--muted)]/5 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--muted)]">
            New to FounderOS? <Link href="/signup" className="text-[var(--foreground)] font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
