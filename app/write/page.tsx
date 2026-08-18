'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSession } from '@/lib/session';
import Link from 'next/link';

interface Article {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url: string;
  status: 'draft' | 'pending' | 'published';
}

const categories = ['Ideas', 'Community', 'News', 'Adventures', 'Fun & Games', 'Other'];

export default function WritePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [article, setArticle] = useState<Article>({
    title: '',
    excerpt: '',
    content: '',
    category: 'News',
    cover_url: '',
    status: 'draft',
  });

  const handleChange = (field: keyof Article, value: any) => {
    setArticle((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (status: 'draft' | 'pending') => {
    setLoading(true);
    setError('');

    if (!article.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!article.excerpt.trim()) {
      setError('Excerpt is required');
      setLoading(false);
      return;
    }

    if (!article.content.trim()) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save article');
      }

      const data = await response.json();
      router.push(`/articles/${data.slug}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Write a New Article</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Share your story with the BrightPress community
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Title */}
          <div>
            <label className="form-label">Title</label>
            <input
              type="text"
              placeholder="Enter article title..."
              value={article.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="form-input"
            />
            <p className="form-hint">{article.title.length}/140 characters</p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="form-label">Excerpt</label>
            <textarea
              placeholder="A brief summary of your article..."
              value={article.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={2}
              className="form-textarea"
            />
            <p className="form-hint">{article.excerpt.length}/300 characters</p>
          </div>

          {/* Content */}
          <div>
            <label className="form-label">Content</label>
            <textarea
              placeholder="Write your article here... (Markdown not yet supported)"
              value={article.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={12}
              className="form-textarea font-mono"
            />
            <p className="form-hint">Minimum 30 characters</p>
          </div>

          {/* Category */}
          <div>
            <label className="form-label">Category</label>
            <select
              value={article.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="form-select"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Cover URL */}
          <div>
            <label className="form-label">Cover Image URL (optional)</label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={article.cover_url}
              onChange={(e) => handleChange('cover_url', e.target.value)}
              className="form-input"
            />
            <p className="form-hint">A URL to an image to display as the cover</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSave('pending')}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </button>
            <Link href="/my-articles" className="btn btn-secondary text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

