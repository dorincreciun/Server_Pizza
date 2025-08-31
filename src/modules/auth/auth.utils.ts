import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import dayjs from 'dayjs';

import { env } from '../../config/env.js';

export type JwtPayload = { sub: number; type: 'access' | 'refresh' };

export function signAccessToken(userId: number) {
  return jwt.sign({ sub: userId, type: 'access' } as JwtPayload, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(userId: number) {
  return jwt.sign({ sub: userId, type: 'refresh' } as JwtPayload, env.JWT_REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.REFRESH_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

export async function hashPassword(password: string) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateEmailToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = dayjs().add(1, 'day').toDate();
  return { token, expiresAt };
}
