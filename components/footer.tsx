import Link from 'next/link';
import { Lightbulb } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-400 dark:text-slate-500 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-white">BrightPress</span>
            </div>
            <p className="text-sm">
              A kid-friendly publishing platform for sharing ideas and stories.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/articles" className="hover:text-white transition">Browse Stories</Link></li>
              <li><Link href="/write" className="hover:text-white transition">Write Article</Link></li>
              <li><Link href="/articles?category=ideas" className="hover:text-white transition">Categories</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin" className="hover:text-white transition">Moderation</Link></li>
              <li><a href="#" className="hover:text-white transition">Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition">Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} BrightPress. All rights reserved. Made with ✨ for curious minds.
          </p>
        </div>
      </div>
    </footer>
  );
}

