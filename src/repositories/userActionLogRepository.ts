import { randomUUID } from 'crypto';

import { getDatabasePool } from '../config/database';

export interface UserActionLog {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

interface UserActionLogRow {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const pool = getDatabasePool();

function mapRowToUserActionLog(row: UserActionLogRow): UserActionLog {
  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    metadata: row.metadata ?? {},
    createdAt: new Date(row.created_at),
  };
}

export async function createUserActionLog(params: {
  userId: string;
  action: string;
  metadata?: Record<string, unknown>;
}): Promise<UserActionLog> {
  const id = randomUUID();
  const metadata = params.metadata ?? {};

  const result = await pool.query<UserActionLogRow>(
    `INSERT INTO user_action_logs (id, user_id, action, metadata)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, action, metadata, created_at`,
    [id, params.userId, params.action, metadata],
  );

  return mapRowToUserActionLog(result.rows[0]);
}
