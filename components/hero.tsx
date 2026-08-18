import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface HeroProps {
  user?: any;
}

export function Hero({ user }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 py-20 sm:py-32">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 dark:bg-amber-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 dark:bg-orange-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Welcome to BrightPress</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block">Share Your</span>
            <span className="block bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Brightest Ideas
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400">
            A kid-friendly publishing platform where curious minds share stories, learn together, and celebrate creativity.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <>
                <Link
                  href="/write"
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Start Writing
                </Link>
                <Link
                  href="/articles"
                  className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  Explore Stories
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/admin/login"
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Sign In to Write
                </Link>
                <Link
                  href="/articles"
                  className="px-8 py-4 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  Browse Stories
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}

