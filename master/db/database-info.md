# Database Schema Documentation

## Overview
This database schema models a comprehensive e-commerce system that manages stores, products, images, and categories. The design emphasizes extensibility, clarity, and efficient graph-based querying capabilities.

## Schema Structure

### 1. Store Table (`storeTable`)
- **Primary Key**: `id`
- **Relationships**:
  - `products`: One-to-many relationship with `productTable`
    - A store can have multiple products
    - Each product belongs to exactly one store

### 2. Product Table (`productTable`)
- **Primary Key**: `id`
- **Foreign Keys**:
  - `storeId` → `storeTable.id`
    - Establishes the relationship between products and stores
    - Implements a many-to-one relationship
  - `categoryId` → `categoryTable.id`
    - Links products to their respective categories
    - Each product belongs to one category

- **Relationships**:
  - `store`: Many-to-one relationship with `storeTable`
  - `category`: Many-to-one relationship with `categoryTable`
  - `images`: One-to-many relationship with `imageTable`
    - A product can have multiple associated images
    - Images are deleted when their parent product is deleted

### 3. Image Table (`imageTable`)
- **Primary Key**: `id`
- **Foreign Keys**:
  - `productId` → `productTable.id`
    - Each image belongs to one product
    - Implements cascade delete
  - `storeId` → `storeTable.id`
    - Images are also linked to their parent store

- **Relationships**:
  - `product`: Many-to-one relationship with `productTable`
  - `store`: Many-to-one relationship with `storeTable`

### 4. Category Table (`categoryTable`)
- **Primary Key**: `id`
- **Unique Constraint**: `name`
  - Ensures each category has a unique name

- **Relationships**:
  - `products`: One-to-many relationship with `productTable`
    - Each category can have multiple products
    - Supports reverse lookup from products to categories

## Graph Relationships

The schema supports efficient graph traversal through these relationships:

 To preview the schema run: `bun dbml.ts && bun dbml-renderer -i schema.dbml -o erd.svg`



## Example Query Paths

### Store-based Queries
```sql
-- Get all images for a store
SELECT * FROM storeTable s
JOIN productTable p ON s.id = p.storeId
JOIN imageTable i ON p.id = i.productId
WHERE s.id = ?
```

### Product-based Queries
```sql
-- Get category for a product
SELECT c.* FROM categoryTable c
JOIN productTable p ON c.id = p.categoryId
WHERE p.id = ?
```

### Category-based Queries
```sql
-- Get all products in a category
SELECT p.* FROM productTable p
JOIN categoryTable c ON p.categoryId = c.id
WHERE c.id = ?
```

## Data Integrity

### Cascade Delete Rules
- Deleting a product will automatically delete all associated images
  - Implemented through `onDelete: 'cascade'` on `imageTable.productId`
- Deleting a store will not automatically delete its products or images
  - Ensures data preservation unless explicitly deleted

### Foreign Key Constraints
- All foreign key relationships enforce referential integrity
- Prevents orphaned records in the database
- Ensures data consistency across related tables

## Best Practices

1. **Data Access**
   - Use JOIN operations for efficient data retrieval
   - Leverage indexes on foreign key columns
   - Consider materialized views for frequently accessed data

2. **Performance Optimization**
   - Index frequently queried columns
   - Use appropriate data types for each field
   - Consider partitioning for large datasets

3. **Data Integrity**
   - Regularly backup the database
   - Implement appropriate validation rules
   - Use transactions for complex operations

## Schema Evolution

The schema is designed to be extensible, allowing for:
- Additional product attributes
- New store properties
- Enhanced category hierarchy
- Additional image metadata

When making changes:
1. Document all schema modifications
2. Update relationships accordingly
3. Test data integrity
4. Update example queries

## Troubleshooting

### Common Issues
1. **Missing Relationships**
   - Verify foreign key constraints
   - Check for null values in required fields

2. **Performance Bottlenecks**
   - Review query execution plans
   - Add appropriate indexes
   - Consider query optimization

3. **Data Inconsistency**
   - Check cascade delete rules
   - Verify referential integrity
   - Run database consistency checks

## Schema Version
Current schema version: 1.0.0

Last updated: May 9, 2025