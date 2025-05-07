import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, varchar, timestamp, uuid } from 'drizzle-orm/pg-core'; // Added uuid import

export const storeTable = pgTable("store", {
  id: uuid("id").defaultRandom().primaryKey(), // Fixed uuid usage
  name: varchar('name', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});