import { format } from "date-fns";
import { db } from "@/lib/db";
import { productTable, categoryTable, imageTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ProductForm } from "@/app/(dashboard)/[storeId]/(routes)/products/[productId]/components/product-form";

interface ProductPageProps {
  params: {
    storeId: string;
    productId: string;
  };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  // In this context, params is always an object, not a Promise
  const { storeId, productId } = params;

  // Fetch all categories for the dropdown
  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, storeId),
  });

  // If creating a new product, skip DB query for product
  if (productId === "new") {
    return (
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          <ProductForm initialData={undefined} categories={categories} storeId={storeId} />
        </div>
      </div>
    );
  }

  // Type guard for UUID (simple regex, can be improved)
  const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productId);
  if (!isUUID) {
    return (
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6">
          <p>Invalid product ID</p>
        </div>
      </div>
    );
  }

  // Fetch the product with its category
  const product = await db.query.productTable.findFirst({
    where: and(
      eq(productTable.id, productId),
      eq(productTable.storeId, storeId)
    ),
    with: {
      category: true,
      images: true,
    },
  });

  if (!product) {
    return (
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6">
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ProductForm initialData={product} categories={categories} storeId={storeId} />
      </div>
    </div>
  );
};

export default ProductPage;
