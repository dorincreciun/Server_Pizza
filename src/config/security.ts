import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { Env, getCorsOrigins } from './env.js';

export function createAppSecurity(env: Env) {
  const origins = getCorsOrigins(env.CORS_ORIGINS);
  const corsMiddleware = cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser tools
      if (origins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });

  const windowMs = env.RATE_LIMIT_WINDOW_MIN * 60 * 1000;
  const globalLimiter = rateLimit({
    windowMs,
    max: env.RATE_LIMIT_MAX_GLOBAL,
    standardHeaders: true,
  });

  return { corsMiddleware, globalLimiter };
}
