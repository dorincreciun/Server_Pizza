import { Router } from 'express';

export const ordersRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Orders endpoints
 */

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: List my orders
 *     responses:
 *       200:
 *         description: OK
 */
ordersRouter.get('/my', (_req, res) => {
  res.json({ items: [], page: 1, limit: 12, total: 0, totalPages: 0 });
});

/**
 * @swagger
 * /api/orders/recommendations:
 *   get:
 *     tags: [Orders]
 *     summary: Get product recommendations
 *     responses:
 *       200:
 *         description: OK
 */
ordersRouter.get('/recommendations', (_req, res) => {
  res.json({ items: [] });
});
