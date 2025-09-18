import { randomUUID } from 'crypto';

import { getDatabasePool } from '../config/database';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

const pool = getDatabasePool();

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
  };
}

export async function createUser(params: Omit<User, 'id'>): Promise<User> {
  const id = randomUUID();
  const email = params.email.toLowerCase();

  const result = await pool.query<UserRow>(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, password_hash`,
    [id, params.name, email, params.passwordHash],
  );

  return mapRowToUser(result.rows[0]);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email.toLowerCase()],
  );

  return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, name, email, password_hash
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id],
  );

  return result.rows[0] ? mapRowToUser(result.rows[0]) : null;
}
