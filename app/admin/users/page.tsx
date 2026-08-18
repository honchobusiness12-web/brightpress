import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Manage Users | BrightPress Admin',
};

async function getUsers() {
  try {
    const result = await query(
      `SELECT id, email, name, avatar_url, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT 200`
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export default async function AdminUsersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Check admin role only
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    );

    if (!result.rows[0] || result.rows[0].role !== 'admin') {
      redirect('/');
    }
  } catch (error) {
    redirect('/');
  }

  const users = await getUsers();

  const grouped = {
    admin: users.filter((u: any) => u.role === 'admin'),
    editor: users.filter((u: any) => u.role === 'editor'),
    moderator: users.filter((u: any) => u.role === 'moderator'),
    user: users.filter((u: any) => u.role === 'user'),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Users</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Total users: {users.length}
            </p>
          </div>
          <Link href="/admin" className="btn btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Admin Users */}
        {grouped.admin.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Admins ({grouped.admin.length})</h2>
            <div className="space-y-3">
              {grouped.admin.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {user.avatar_url && (
                      <Image
                        src={user.avatar_url}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Admin</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Editors */}
        {grouped.editor.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Editors ({grouped.editor.length})</h2>
            <div className="space-y-3">
              {grouped.editor.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {user.avatar_url && (
                      <Image
                        src={user.avatar_url}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="badge badge-primary">Editor</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Moderators */}
        {grouped.moderator.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Moderators ({grouped.moderator.length})</h2>
            <div className="space-y-3">
              {grouped.moderator.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {user.avatar_url && (
                      <Image
                        src={user.avatar_url}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="badge badge-warning">Moderator</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Regular Users */}
        {grouped.user.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Users ({grouped.user.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped.user.map((user: any) => (
                <div key={user.id} className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {user.avatar_url && (
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

