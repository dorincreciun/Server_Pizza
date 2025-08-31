import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from './auth.utils.js';

export type AuthRequest = Request & { user?: { id: number } };

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
  }
  const token = auth.slice(7);
  try {
    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') throw new Error('Invalid token');
    req.user = { id: Number(payload.sub) };
    next();
  } catch (e) {
    return res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
  }
}
