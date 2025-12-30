import 'dotenv/config';
import type { Secret, SignOptions } from 'jsonwebtoken';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET') as Secret,
  JWT_EXPIRES_IN: (process.env.JWT_EXPIRES_IN || '7d')  as SignOptions['expiresIn'],
} as const;