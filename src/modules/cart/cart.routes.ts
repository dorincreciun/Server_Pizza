import { Router } from 'express';

export const cartRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Cart endpoints
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get current cart
 *     responses:
 *       200:
 *         description: OK
 */
cartRouter.get('/', (_req, res) => {
  res.json({ id: null, items: [] });
});
