import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { findUserById } from '../repositories/userRepository';

type JwtContent = jwt.JwtPayload & {
  sub: string;
};

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token nao informado.' });
    return;
  }

  const token = authorizationHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtContent;

    if (!payload.sub) {
      res.status(401).json({ message: 'Token invalido.' });
      return;
    }

    const user = await findUserById(payload.sub);

    if (!user) {
      res.status(401).json({ message: 'Usuario nao encontrado.' });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalido.' });
  }
}
