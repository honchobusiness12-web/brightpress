import Link from 'next/link';
import { BookOpen, Lightbulb, Users, Rocket, Home, Smile } from 'lucide-react';

const categories = [
  { name: 'All Stories', slug: 'all', icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
  { name: 'Ideas', slug: 'ideas', icon: Lightbulb, color: 'from-amber-500 to-orange-500' },
  { name: 'Community', slug: 'community', icon: Users, color: 'from-pink-500 to-rose-500' },
  { name: 'Adventures', slug: 'adventures', icon: Rocket, color: 'from-purple-500 to-indigo-500' },
  { name: 'News', slug: 'news', icon: Home, color: 'from-green-500 to-emerald-500' },
  { name: 'Fun & Games', slug: 'fun', icon: Smile, color: 'from-yellow-500 to-amber-500' },
];

export function CategoriesGrid() {
  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Explore by Category</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Discover stories across your favorite topics
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/articles?category=${category.slug}`}
                className={`group relative p-8 rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>

                <div className="relative flex flex-col items-center justify-center space-y-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} bg-clip-padding`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-center">{category.name}</span>
                  <div className={`h-1 w-0 group-hover:w-8 bg-gradient-to-r ${category.color} transition-all`}></div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

