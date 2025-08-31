import { Router } from 'express';

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
categoriesRouter.get('/', (_req, res) => {
  res.json({ items: [], total: 0 });
});
