import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'node:path';

import { env } from '../config/env.js';
import { createAppSecurity } from '../config/security.js';
import { logger, requestLogger } from '../utils/logger.js';
import { notFound } from '../middlewares/notFound.middleware.js';
import { errorHandler } from '../middlewares/error.middleware.js';
import { appRouter } from './routes.js';
import { swaggerMiddleware } from '../config/swagger.js';

const app = express();

// Security & parsers
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(hpp());
app.use(helmet());
app.use(compression());

// CORS & rate limiters
const { corsMiddleware, globalLimiter } = createAppSecurity(env);
app.use(corsMiddleware);
app.use(globalLimiter);

// Logging
app.use(requestLogger);

// Health
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Docs
app.use('/docs', ...swaggerMiddleware.ui);
app.get('/docs-json', swaggerMiddleware.json);

// Serve static images from /img
app.use('/img', express.static(path.resolve(process.cwd(), 'img')));

// API routes
app.use('/api', appRouter);

// Not found and errors
app.use(notFound);
app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  logger.info({ msg: `Server listening on http://localhost:${port}` });
});
