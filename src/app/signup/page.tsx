'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Github, AlertCircle, ArrowLeft, Check } from 'lucide-react';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setSuccess(true); // Account created but login failed (rare), separate flow
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'github') => {
    if (provider === 'google') setGoogleLoading(true);
    else setGithubLoading(true);
    setError(null);
    await signIn(provider, { callbackUrl: '/dashboard' });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold">Account Created!</h2>
          <p className="text-[var(--muted)]">
            Your account has been created successfully.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Continue to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="space-y-2 text-center">
            <Link href="/" className="inline-block mb-4 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-[var(--muted)]">Join 500+ founders tracking their build.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => socialLogin('google')}
                variant="outline"
                className="h-11 font-normal"
                isLoading={googleLoading}
                disabled={loading || githubLoading}
              >
                {!googleLoading && <span className="mr-2">G</span>}
                Google
              </Button>

              <Button
                onClick={() => socialLogin('github')}
                variant="outline"
                className="h-11 font-normal"
                isLoading={githubLoading}
                disabled={loading || googleLoading}
              >
                {!githubLoading && <Github className="w-4 h-4 mr-2" />}
                GitHub
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--card)] px-2 text-[var(--muted)]">Or sign up with email</span>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)] transition-all outline-none text-sm"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
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
                  <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/20 focus:border-[var(--foreground)] transition-all outline-none text-sm"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" isLoading={loading} disabled={googleLoading || githubLoading}>
                Create Account
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
            Already have an account? <Link href="/login" className="text-[var(--foreground)] font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}