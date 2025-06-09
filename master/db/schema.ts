
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
  categoryId: uuid('category_id').references(() => categoryTable.id, { onDelete: 'set null' }),
  storeId: uuid('store_id').references(() => storeTable.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categoryTable = pgTable('category', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
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

export const salesTable = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  sale_date: timestamp('sale_date').notNull(),
  transaction_number: varchar('transaction_number', { length: 255 }).notNull(),
  card_type: varchar('card_type', { length: 50 }), // e.g., 'credit', 'debit'
  card_brand: varchar('card_brand', { length: 100 }), // e.g., 'Visa', 'MasterCard'
  installments: integer('installments'),
  payment_plan: varchar('payment_plan', { length: 255 }),
  currency: varchar('currency', { length: 10 }).notNull(), // e.g., 'PYG', 'USD'
  gross_amount: decimal('gross_amount', { precision: 12, scale: 2 }).notNull(),
  branch_code: varchar('branch_code', { length: 100 }),
  transaction_status: varchar('transaction_status', { length: 50 }).notNull(), // e.g., 'approved', 'cancelled'
  net_amount: decimal('net_amount', { precision: 12, scale: 2 }),
  commission_amount: decimal('commission_amount', { precision: 10, scale: 2 }),
  income_tax_withholding: decimal('income_tax_withholding', { precision: 10, scale: 2 }),
  vat_withholding: decimal('vat_withholding', { precision: 10, scale: 2 }),
  settlement_date: timestamp('settlement_date'),
  promo_discount: decimal('promo_discount', { precision: 10, scale: 2 }),
  payment_method: varchar('payment_method', { length: 100 }),
  storeId: uuid('store_id').references(() => storeTable.id, { onDelete: 'cascade' }),
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
