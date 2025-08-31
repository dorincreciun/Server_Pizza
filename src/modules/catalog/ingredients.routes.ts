import { Router } from 'express';

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
ingredientsRouter.get('/', (_req, res) => {
  res.json({ items: [], total: 0 });
});
