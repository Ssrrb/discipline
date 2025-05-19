import { format } from "date-fns";
import { db } from "@/lib/db";
import { productTable, categoryTable } from "@/db/schema";
import { ProductClient } from "./components/client";
import { ProductColumn } from "./components/columns";
import { eq, desc, and } from "drizzle-orm";

const ProductsPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const { storeId } = params;
  
  // Fetch products with their categories
  const products = await db
    .select({
      id: productTable.id,
      name: productTable.name,
      description: productTable.description,
      price: productTable.price,
      stock: productTable.stock,
      category: categoryTable.name,
      createdAt: productTable.createdAt,
    })
    .from(productTable)
    .leftJoin(
      categoryTable,
      eq(productTable.categoryId, categoryTable.id)
    )
    .where(eq(productTable.storeId, storeId))
    .orderBy(desc(productTable.createdAt));

  // Format the data for the table
  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: `$${parseFloat(item.price || '0').toFixed(2)}`,
    stock: item.stock || 0,
    category: item.category || "No category",
    createdAt: item.createdAt ? format(item.createdAt, "MMMM do, yyyy") : "",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;
