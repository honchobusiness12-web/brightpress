import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var __brightpressPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
}

// Reuse the pool across hot reloads in development and across invocations in production.
const pool = global.__brightpressPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  global.__brightpressPool = pool;
}

export default pool;

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  } finally {
    client.release();
  }
}
