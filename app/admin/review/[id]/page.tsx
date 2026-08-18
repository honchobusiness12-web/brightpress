'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url?: string;
  status: string;
  author_id: string;
  name: string;
  avatar_url?: string;
}

export default function ReviewArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/admin/articles/${id}`);
        if (!res.ok) {
          setError('Article not found or not pending');
          setLoading(false);
          return;
        }

        const data = await res.json();
        setArticle(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handlePublish = async () => {
    if (!article) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/articles/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.push('/admin/moderation?success=Article published');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!article) return;

    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/articles/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.push('/admin/moderation?success=Article rejected');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
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
            <Link href="/admin/moderation" className="btn btn-secondary">
              Back to Moderation
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
        <Link
          href="/admin/moderation"
          className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Moderation
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Article Preview */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
          {/* Author Info */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
            {article.avatar_url && (
              <Image
                src={article.avatar_url}
                alt={article.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full"
              />
            )}
            <div>
              <p className="font-bold text-lg">{article.name}</p>
              <p className="text-slate-600 dark:text-slate-400">Author ID: {article.author_id}</p>
            </div>
          </div>

          {/* Title & Excerpt */}
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex gap-4 mb-6">
            <span className="badge badge-warning">{article.category}</span>
            <span className="badge badge-primary">Pending Review</span>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">{article.excerpt}</p>

          {/* Cover Image */}
          {article.cover_url && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg mb-8 bg-slate-200 dark:bg-slate-700">
              <Image
                src={article.cover_url}
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Content Preview */}
          <div className="prose dark:prose-invert max-w-none">
            {article.content.split('\n').map((paragraph: string, idx: number) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Decision Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Publish */}
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-bold text-green-900 dark:text-green-200">Approve & Publish</h3>
            </div>
            <p className="text-sm text-green-800 dark:text-green-300 mb-6">
              This article meets our guidelines and is ready for publication.
            </p>
            <button
              onClick={handlePublish}
              disabled={submitting}
              className="w-full btn bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>

          {/* Reject */}
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-bold text-red-900 dark:text-red-200">Reject</h3>
            </div>
            <p className="text-sm text-red-800 dark:text-red-300 mb-4">
              Explain why this article does not meet our guidelines.
            </p>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="form-textarea mb-4"
            />
            <button
              onClick={handleReject}
              disabled={submitting}
              className="w-full btn bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? 'Rejecting...' : 'Reject Article'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

