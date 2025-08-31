import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { categoriesRouter } from '../modules/catalog/categories.routes.js';
import { ingredientsRouter } from '../modules/catalog/ingredients.routes.js';
import { productsRouter } from '../modules/catalog/products.routes.js';
import { cartRouter } from '../modules/cart/cart.routes.js';
import { ordersRouter } from '../modules/orders/orders.routes.js';

export const appRouter = Router();

const windowMs = env.RATE_LIMIT_WINDOW_MIN * 60 * 1000;
const authLimiter = rateLimit({ windowMs, max: env.RATE_LIMIT_MAX_AUTH, standardHeaders: true });

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health check endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: OK
 */

// Mount modules
appRouter.use('/auth', authLimiter, authRouter);
appRouter.use('/users', usersRouter);
appRouter.use('/categories', categoriesRouter);
appRouter.use('/ingredients', ingredientsRouter);
appRouter.use('/products', productsRouter);
appRouter.use('/cart', authLimiter, cartRouter);
appRouter.use('/orders', authLimiter, ordersRouter);
