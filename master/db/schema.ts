import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, varchar, timestamp, uuid, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';


export const storeTable = pgTable('store', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productTable = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  price: decimal('price').notNull(),
  stock: integer('stock').notNull(),
  storeId: uuid('store_id').references(() => storeTable.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const storeRelations = relations(storeTable, ({ many }) => ({
  products: many(productTable),
}));

export const productRelations = relations(productTable, ({ one }) => ({
  store: one(storeTable, {
    fields: [productTable.storeId],
    references: [storeTable.id],
  }),
}));
