import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata = {
  title: 'Settings | BrightPress',
};

async function getProfile(userId: string) {
  try {
    const result = await query(
      `SELECT p.*, u.email, u.name
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const profile = await getProfile(session.userId);

  if (!profile) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Settings</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your profile and account preferences
          </p>
        </div>

        {/* Profile Settings Card */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="form-label">Display Name</label>
              <input
                type="text"
                value={profile.display_name}
                readOnly
                className="form-input bg-slate-100 dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                value={profile.username}
                readOnly
                className="form-input bg-slate-100 dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="form-input bg-slate-100 dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="form-label">Bio</label>
              <textarea
                value={profile.bio || ''}
                readOnly
                rows={3}
                className="form-textarea bg-slate-100 dark:bg-slate-700"
              />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Profile updates coming soon. Please contact support to modify your profile.
            </p>
          </div>
        </div>

        {/* Account Settings */}
        <div className="card mb-6">
          <h2 className="text-2xl font-bold mb-6">Account</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Signed in with Google</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your account is connected to your Google account for secure sign-in.
              </p>
              <form action="/api/auth/logout" method="POST">
                <button className="btn btn-danger">Sign Out</button>
              </form>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-200 dark:border-red-900">
          <h2 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">Danger Zone</h2>

          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              disabled
              className="btn btn-danger opacity-50 cursor-not-allowed"
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link
            href="/"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

