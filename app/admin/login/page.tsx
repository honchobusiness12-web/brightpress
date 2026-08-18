import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';

export const metadata = {
  title: 'Sign In | BrightPress',
};

export default async function AdminLoginPage() {
  const session = await getSession();

  // Redirect if already logged in
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Lightbulb className="w-8 h-8 text-amber-500" />
            <span className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              BrightPress
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Sign In</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Join the community of bright minds
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
          {/* Google Sign In */}
          <a
            href="/api/auth/login"
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition font-semibold"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </a>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">or</span>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 BrightPress uses Google Sign-In for safe, secure authentication. No password required!
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-amber-600 dark:text-amber-400 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-amber-600 dark:text-amber-400 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-600 dark:text-slate-400">
            Need help?{' '}
            <a href="#" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

