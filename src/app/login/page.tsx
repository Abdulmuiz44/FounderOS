'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    
    setLoading(false);
    if (error) setMessage('Unable to send magic link. Please try again.');
    else setMessage('Check your email for the magic link!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="max-w-xs w-full space-y-8 animate-fade-in text-center">
        <div className="space-y-2">
          <Link href="/" className="font-bold text-xl tracking-tight block mb-8">FounderOS</Link>
          <h1 className="text-xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-[var(--muted)] text-sm">Enter your email to sign in.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            className="w-full px-4 py-3 rounded-md border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all outline-none text-center"
            placeholder="builder@project.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full h-11" isLoading={loading}>Send Magic Link</Button>
          {message && <p className="text-sm text-[var(--muted)]">{message}</p>}
        </form>
      </div>
    </div>
  );
}
