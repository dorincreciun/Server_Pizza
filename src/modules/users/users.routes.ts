import { Router } from 'express';

export const usersRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Users endpoints
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     responses:
 *       200:
 *         description: OK
 */
import { requireAuth, type AuthRequest } from '../auth/auth.middleware.js';
import { prisma } from '../../db/client.js';

usersRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true, phone: true, role: true, emailVerifiedAt: true } });
  res.json({ user });
});
