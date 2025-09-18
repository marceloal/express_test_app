import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { createUser, findUserByEmail } from '../repositories/userRepository';
import { createUserActionLog } from '../repositories/userActionLogRepository';

const authRouter = Router();

function buildAuthToken(payload: { id: string; name: string; email: string }): string {
  return jwt.sign(
    {
      sub: payload.id,
      name: payload.name,
      email: payload.email,
    },
    env.jwtSecret,
    { expiresIn: '1h' },
  );
}

authRouter.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    res.status(400).json({ message: 'Informe nome, email e senha.' });
    return;
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    res.status(409).json({ message: 'Email ja cadastrado.' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await createUser({
      name,
      email,
      passwordHash,
    });

    const token = buildAuthToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuario.' });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ message: 'Informe email e senha.' });
    return;
  }

  const user = await findUserByEmail(email);

  if (!user) {
    res.status(401).json({ message: 'Credenciais invalidas.' });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    res.status(401).json({ message: 'Credenciais invalidas.' });
    return;
  }

  const token = buildAuthToken(user);

  try {
    await createUserActionLog({
      userId: user.id,
      action: 'login',
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? null,
      },
    });
  } catch (error) {
    console.error('[auth] Falha ao registrar log de login.', error);
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  });
});

export default authRouter;




