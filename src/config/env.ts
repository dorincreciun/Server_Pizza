import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_ACCESS_SECRET: z.string().default('dev_access_secret_change_me'),
  JWT_REFRESH_SECRET: z.string().default('dev_refresh_secret_change_me'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MIN: z.coerce.number().int().positive().default(15),
  RATE_LIMIT_MAX_GLOBAL: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().int().positive().default(100),
  TAX_PERCENT: z.coerce.number().nonnegative().default(8),
  DELIVERY_FEE: z.coerce.number().nonnegative().default(20),
  FREE_DELIVERY_THRESHOLD: z.coerce.number().nonnegative().default(200),
  ETA_MIN: z.coerce.number().int().positive().default(40),
  ETA_MAX: z.coerce.number().int().positive().default(60),
  USE_COOKIES: z.coerce.boolean().default(true),
  EMAIL_FROM_NAME: z.string().default('Pizza Shop'),
  EMAIL_FROM_ADDRESS: z.string().default('no-reply@example.local'),
  PAYMENT_DEFAULT_STATUS: z.enum(['platit', 'respins', 'in_asteptare']).default('platit'),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

export function getCorsOrigins(originsCsv: string): string[] {
  return originsCsv.split(',').map((s) => s.trim()).filter(Boolean);
}
