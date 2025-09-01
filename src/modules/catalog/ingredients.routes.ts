import { Router } from 'express';
import { prisma } from '../../db/client.js';

export const ingredientsRouter = Router();

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     tags: [Catalog]
 *     summary: List ingredients
 *     responses:
 *       200:
 *         description: OK
 */
ingredientsRouter.get('/', async (_req, res, next) => {
  try {
    const items = await prisma.ingredient.findMany({ select: { id: true, name: true, slug: true, priceDelta: true } });
    res.json(items);
  } catch (e) {
    next(e);
  }
});
