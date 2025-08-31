import { Router } from 'express';

import { validateBody, validateParams, validateQuery } from '../../middlewares/zod.middleware.js';
import { changePasswordSchema, loginSchema, refreshSchema, registerSchema, verifyEmailQuerySchema } from './auth.schemas.js';
import { changePassword, login, refresh, registerUser, verifyEmail } from './auth.service.js';
import { verifyRefreshToken } from './auth.utils.js';
import { env } from '../../config/env.js';
import { requireAuth, type AuthRequest } from './auth.middleware.js';

export const authRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register user and send verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201:
 *         description: Created
 */
authRouter.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({ user: result });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email via token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Verified
 */
authRouter.get('/verify-email', validateQuery(verifyEmailQuerySchema), async (req, res, next) => {
  try {
    await verifyEmail(String(req.query.token));
    res.json({ verified: true });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await login(req.body);
    if (env.USE_COOKIES) {
      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000 });
    }
    res.json({ user, accessToken, ...(env.USE_COOKIES ? {} : { refreshToken }) });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post('/refresh', validateBody(refreshSchema), async (req, res) => {
  const token = env.USE_COOKIES ? String(req.cookies?.refreshToken || '') : String(req.body?.refreshToken || '');
  if (!token) return res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
  try {
    const payload = verifyRefreshToken(token);
    const { accessToken } = await refresh(Number(payload.sub));
    res.json({ accessToken });
  } catch {
    res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user (clear refresh cookie if used)
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post('/logout', (req, res) => {
  if (env.USE_COOKIES) {
    res.clearCookie('refreshToken');
  }
  res.json({ ok: true });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current user profile
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  res.json({ userId: req.user!.id });
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password
 *     responses:
 *       200:
 *         description: OK
 */
authRouter.post('/change-password', requireAuth, validateBody(changePasswordSchema), async (req: AuthRequest, res, next) => {
  try {
    await changePassword(req.user!.id, req.body.oldPassword, req.body.newPassword);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/auth/csrf-token:
 *   get:
 *     tags: [Auth]
 *     summary: Get CSRF token (if cookies are used)
 *     responses:
 *       200:
 *         description: Token
 */
authRouter.get('/csrf-token', (_req, res) => {
  res.json({ csrfToken: 'ok' });
});
