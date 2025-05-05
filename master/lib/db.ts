// lib/db.ts (shared instance)
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const connection = neon(process.env.DATABASE_URL!);
export const db = drizzle(connection);