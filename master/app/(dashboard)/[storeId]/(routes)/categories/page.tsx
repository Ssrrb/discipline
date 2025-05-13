import { CategoryClient } from "./components/client";
import { db } from "@/lib/db";
import { categoryTable } from "@/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";

export default async function CategoriesPage({
  params
}: {
  params: { storeId: string }
}) {
  const categories = await db
    .select()
    .from(categoryTable)
    .where(eq(categoryTable.storeId, params.storeId));

  const formattedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description || '',
    createdAt: category.createdAt ? format(category.createdAt, 'MMMM dd, yyyy') : 'N/A'
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
}
