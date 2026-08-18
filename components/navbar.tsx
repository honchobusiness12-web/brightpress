'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, Lightbulb } from 'lucide-react';

interface Session {
  userId: string;
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
          setUserName(data.name || 'User');
        }
      } catch (error) {
        console.error('Failed to check session:', error);
      }
    };
    checkSession();
  }, []);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
            <Lightbulb className="w-6 h-6 text-amber-500" />
            <span className="hidden sm:inline bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              BrightPress
            </span>
            <span className="sm:hidden bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              BP
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-amber-500 transition">Home</Link>
            <Link href="/articles" className="hover:text-amber-500 transition">Browse</Link>
            
            {session ? (
              <>
                <Link href="/write" className="hover:text-amber-500 transition">Write</Link>
                <Link href="/my-articles" className="hover:text-amber-500 transition">My Articles</Link>
                <Link href="/dashboard" className="hover:text-amber-500 transition">Dashboard</Link>
                <Link href="/settings" className="hover:text-amber-500 transition">Settings</Link>
                <form action="/api/auth/logout" method="POST">
                  <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link href="/admin/login" className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition">
                Sign In
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link href="/" className="block py-2 hover:text-amber-500 transition">Home</Link>
            <Link href="/articles" className="block py-2 hover:text-amber-500 transition">Browse</Link>
            {session ? (
              <>
                <Link href="/write" className="block py-2 hover:text-amber-500 transition">Write</Link>
                <Link href="/my-articles" className="block py-2 hover:text-amber-500 transition">My Articles</Link>
                <Link href="/dashboard" className="block py-2 hover:text-amber-500 transition">Dashboard</Link>
                <Link href="/settings" className="block py-2 hover:text-amber-500 transition">Settings</Link>
                <form action="/api/auth/logout" method="POST">
                  <button className="w-full text-left px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link href="/admin/login" className="block px-4 py-2 bg-amber-500 text-white rounded-lg text-center">
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

