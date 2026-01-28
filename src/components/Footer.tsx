import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Twitter, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] pt-16 pb-8">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="font-bold text-lg tracking-tight mb-4 block">FounderOS</Link>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            The operating system for AI builders.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/pricing" className="hover:text-[var(--foreground)] transition-colors">Pricing</Link></li>
            <li><Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Log In</Link></li>
            <li><Link href="/signup" className="hover:text-[var(--foreground)] transition-colors">Sign Up</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] mb-4">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-[var(--muted)] cursor-not-allowed">Manifesto</span></li>
            <li><span className="text-[var(--muted)] cursor-not-allowed">Blog</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-[var(--muted)] cursor-not-allowed">Privacy</span></li>
            <li><span className="text-[var(--muted)] cursor-not-allowed">Terms</span></li>
            <li><span className="text-[var(--muted)] cursor-not-allowed">Contact</span></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted)]">
          &copy; {new Date().getFullYear()} FounderOS. Confidential by design.
        </p>
        <div className="flex items-center gap-4">
           <Link href="https://twitter.com" target="_blank" className="text-[var(--muted)] hover:text-[var(--foreground)]"><Twitter className="w-4 h-4" /></Link>
           <Link href="https://github.com" target="_blank" className="text-[var(--muted)] hover:text-[var(--foreground)]"><Github className="w-4 h-4" /></Link>
           <div className="w-px h-4 bg-[var(--border)]"></div>
           <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}