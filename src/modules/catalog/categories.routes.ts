import { Router } from 'express';
import { prisma } from '../../db/client.js';

export const categoriesRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Catalog
 *     description: Catalog endpoints
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Catalog]
 *     summary: List categories
 *     responses:
 *       200:
 *         description: OK
 */
categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
    res.json(cats);
  } catch (e) {
    next(e);
  }
});
