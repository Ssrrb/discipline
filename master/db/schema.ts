
import { pgTable, varchar, timestamp, uuid, integer, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const storeTable = pgTable('store', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const productTable = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  price: decimal('price').notNull(),
  stock: integer('stock').notNull(),
  categoryId: uuid('category_id').references(() => categoryTable.id),
  storeId: uuid('store_id').references(() => storeTable.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categoryTable = pgTable('category', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  storeId: uuid('store_id').references(() => storeTable.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const imageTable = pgTable('image', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: varchar('url', { length: 255 }).notNull(),
  productId: uuid('product_id').references(() => productTable.id, { onDelete: 'cascade' }),
  storeId: uuid('store_id').references(() => storeTable.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const storeRelations = relations(storeTable, ({ many }) => ({
  products: many(productTable),
  categories: many(categoryTable),
}));

export const categoryRelations = relations(categoryTable, ({ one, many }) => ({
  store: one(storeTable, {
    fields: [categoryTable.storeId],
    references: [storeTable.id],
  }),
  products: many(productTable),
}));

export const productRelations = relations(productTable, ({ one, many }) => ({
  store: one(storeTable, {
    fields: [productTable.storeId],
    references: [storeTable.id],
  }),
  category: one(categoryTable, {
    fields: [productTable.categoryId],
    references: [categoryTable.id],
  }),
  images: many(imageTable),
}));

// Define the relationship from image to product
export const imageRelations = relations(imageTable, ({ one }) => ({
  product: one(productTable, {
    fields: [imageTable.productId],
    references: [productTable.id],
  }),
}));
