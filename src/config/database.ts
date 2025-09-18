import { Pool } from 'pg'

import { env } from './env'

const CONNECTION_LOG_PREFIX = '[database]'

const pool = new Pool({
  connectionString: env.databaseUrl
})

async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_action_logs (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
}

export async function connectToDatabase(): Promise<void> {
  try {
    await pool.query('SELECT 1')
    await ensureSchema()
    console.log(
      `${CONNECTION_LOG_PREFIX} Conectado ao PostgreSQL em ${
        env.databaseUrl.split('@')[1]
      }`
    )
  } catch (error) {
    console.error(
      `${CONNECTION_LOG_PREFIX} Falha ao conectar ao PostgreSQL.`,
      error
    )
    throw error
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  await pool.end()
}

export function getDatabasePool(): Pool {
  return pool
}
