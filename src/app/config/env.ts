import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join((process.cwd(), '.env')) });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  APP_URL: z.string().min(1, 'APP_URL is required'),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  STORE_ID: z.string().min(1, 'STORE_ID is required'),
  STORE_PASS: z.string().min(1, 'STORE_PASS is required'),
  IS_LIVE: z.string().default('false').transform(val => val === 'true'),
  SSL_PAYMENT_URL: z.string().min(1, 'SSL_PAYMENT_URL is required'),
  SSL_VALIDATION_URL: z.string().min(1, 'SSL_VALIDATION_URL is required'),

  // JWT secrets and expiry
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error("Invalid environment variables:", envVars.error.format());
  process.exit(1);
}

export const envConfig = {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  db_url: envVars.data.DATABASE_URL,
  app_url: envVars.data.APP_URL,
  google_client_id: envVars.data.GOOGLE_CLIENT_ID,
  google_client_secret: envVars.data.GOOGLE_CLIENT_SECRET,
  store_id: envVars.data.STORE_ID,
  store_pass: envVars.data.STORE_PASS,
  is_live: envVars.data.IS_LIVE,
  ssl_payment_url: envVars.data.SSL_PAYMENT_URL,
  ssl_validation_url: envVars.data.SSL_VALIDATION_URL,

  // JWT secrets and expiry
  jwt_access_secret: envVars.data.JWT_ACCESS_SECRET,
  jwt_refresh_secret: envVars.data.JWT_REFRESH_SECRET,
  jwt_access_expires_in: envVars.data.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: envVars.data.JWT_REFRESH_EXPIRES_IN,
};
