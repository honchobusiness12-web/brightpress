'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getSession } from '@/lib/session';
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
  author_id: string;
}

const categories = ['Ideas', 'Community', 'News', 'Adventures', 'Fun & Games', 'Other'];

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Check auth
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/admin/login');
          return;
        }

        const authData = await authRes.json();
        const userId = authData.id;

        // Fetch article
        const res = await fetch(`/api/articles-by-slug/${slug}`);
        if (!res.ok) {
          setError('Article not found');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setArticle(data);
        setIsOwner(data.author_id === userId);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    load();
  }, [slug, router]);

  const handleChange = (field: keyof Article, value: any) => {
    if (article) {
      setArticle((prev) => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleSave = async (status: 'draft' | 'pending') => {
    if (!article) return;

    setSaving(true);
    setError('');
    setSuccess('');

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
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save article');
      }

      const data = await response.json();
      setSuccess('Article saved successfully!');
      
      setTimeout(() => {
        router.push(`/articles/${data.slug}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <Link href="/articles" className="btn btn-secondary">
            ← Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  if (!article) return null;

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-600 dark:text-red-400 text-lg mb-6">
            You don't have permission to edit this article.
          </p>
          <Link href={`/articles/${slug}`} className="btn btn-secondary">
            ← Back to Article
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          href={`/articles/${slug}`}
          className="inline-flex items-center space-x-2 text-amber-600 dark:text-amber-400 hover:text-amber-700 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Article</span>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Edit Article</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Make changes to your article
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-200 rounded-lg">
            {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {/* Title */}
          <div>
            <label className="form-label">Title</label>
            <input
              type="text"
              value={article.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="form-input"
              disabled={saving}
            />
            <p className="form-hint">{article.title.length}/140 characters</p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="form-label">Excerpt</label>
            <textarea
              value={article.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={2}
              className="form-textarea"
              disabled={saving}
            />
            <p className="form-hint">{article.excerpt.length}/300 characters</p>
          </div>

          {/* Content */}
          <div>
            <label className="form-label">Content</label>
            <textarea
              value={article.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={12}
              className="form-textarea font-mono"
              disabled={saving}
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
              disabled={saving}
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
              value={article.cover_url}
              onChange={(e) => handleChange('cover_url', e.target.value)}
              className="form-input"
              disabled={saving}
            />
            <p className="form-hint">A URL to an image to display as the cover</p>
          </div>

          {/* Status Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              Current status: <strong>{article.status}</strong>
              {article.status === 'published' && ' (Read-only)'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            {article.status !== 'published' && (
              <>
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="btn btn-secondary"
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
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
            <Link href={`/articles/${slug}`} className="btn btn-secondary text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

