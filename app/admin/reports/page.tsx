import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Reports | BrightPress Admin',
};

async function getReports() {
  try {
    const result = await query(
      `SELECT r.*, a.title as article_title, u.name as reporter_name
       FROM reports r
       LEFT JOIN articles a ON r.article_id = a.id
       LEFT JOIN users u ON r.reporter_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 100`
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return [];
  }
}

export default async function AdminReportsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Check admin/moderator role
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    );

    if (!result.rows[0] || !['admin', 'moderator'].includes(result.rows[0].role)) {
      redirect('/');
    }
  } catch (error) {
    redirect('/');
  }

  const reports = await getReports();

  const grouped = {
    open: reports.filter((r: any) => r.status === 'open'),
    reviewed: reports.filter((r: any) => r.status === 'reviewed'),
    resolved: reports.filter((r: any) => r.status === 'resolved'),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">User Reports</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Review and manage reported content
            </p>
          </div>
          <Link href="/admin" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Open Reports */}
        {grouped.open.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">
              Open ({grouped.open.length})
            </h2>
            <div className="space-y-3">
              {grouped.open.map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold mb-2">
                      {report.article_title || 'Comment'} reported by {report.reporter_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Reason: {report.reason}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary text-sm">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviewed Reports */}
        {grouped.reviewed.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Reviewed ({grouped.reviewed.length})</h2>
            <div className="space-y-3">
              {grouped.reviewed.map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold mb-2">
                      {report.article_title || 'Comment'} reported by {report.reporter_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Reason: {report.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resolved Reports */}
        {grouped.resolved.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Resolved ({grouped.resolved.length})</h2>
            <div className="space-y-3">
              {grouped.resolved.map((report: any) => (
                <div
                  key={report.id}
                  className="flex items-start justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold mb-2">
                      {report.article_title || 'Comment'} reported by {report.reporter_name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Reason: {report.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {reports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

