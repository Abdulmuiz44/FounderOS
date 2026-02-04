'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const successMessage = searchParams.get('success');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'Configuration') {
          setError("Email verification failed. Please check your email.");
        } else {
          setError(result.error);
        }
        setLoading(false);
      } else {
        router.push('/pricing');
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: '/dashboard' });
    } catch (error) {
      setError("An error occurred with Google login");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="max-w-sm w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="font-bold text-2xl tracking-tighter block mb-6">FounderOS</Link>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-[var(--muted)] text-sm">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          {successMessage === 'EmailVerified' && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-sm text-green-500 text-center">
              Email verified successfully! You can now log in.
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            variant="secondary"
            className="w-full h-11 relative"
            isLoading={googleLoading}
            disabled={loading}
          >
            {!googleLoading && (
              <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--background)] px-2 text-[var(--muted)]">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all outline-none"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all outline-none"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-11" isLoading={loading} disabled={googleLoading}>
              Sign In
            </Button>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm text-red-500 text-center">
                {error}
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-[var(--muted)]">
          Don't have an account? <Link href="/signup" className="underline hover:text-[var(--foreground)]">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
