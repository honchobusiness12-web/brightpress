'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url: string;
  status: 'draft' | 'pending' | 'published';
  slug: string;
  author_id: string;
}

const categories = ['Ideas', 'Community', 'News', 'Adventures', 'Fun & Games', 'Other'];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Article not found');
          } else if (res.status === 403) {
            setError('You do not have permission to edit this article');
          } else {
            setError('Failed to load article');
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        setArticle(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handleChange = (field: keyof Article, value: any) => {
    if (article) {
      setArticle({ ...article, [field]: value });
    }
  };

  const handleSave = async (newStatus?: 'draft' | 'pending') => {
    if (!article) return;

    setSaving(true);
    setError('');

    if (!article.title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }

    if (!article.excerpt.trim()) {
      setError('Excerpt is required');
      setSaving(false);
      return;
    }

    if (!article.content.trim()) {
      setError('Content is required');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...article,
          status: newStatus || article.status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save article');
      }

      router.push(`/articles/${article.slug}`);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-skeleton h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
            <Link href="/my-articles" className="btn btn-secondary">
              Back to My Articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/my-articles"
            className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Articles
          </Link>
          <h1 className="text-4xl font-bold">Edit Article</h1>
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
              placeholder="Write your article here..."
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

          {/* Status Display */}
          <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Current Status: <span className="capitalize">{article.status}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            {article.status === 'draft' && (
              <>
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="btn btn-secondary"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave('pending')}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Submitting...' : 'Submit for Review'}
                </button>
              </>
            )}
            {article.status !== 'published' && article.status !== 'draft' && (
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            {article.status === 'published' && (
              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="btn btn-secondary"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <Link href="/my-articles" className="btn btn-secondary text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

