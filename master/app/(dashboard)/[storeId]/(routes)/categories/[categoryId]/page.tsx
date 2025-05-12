import { format } from "date-fns";
import { db } from "@/lib/db";
import { categoryTable } from "@/db/schema";
import { CategoryClient } from "../components/client";
import { CategoryColumn } from "../components/columns";
import { eq, desc } from "drizzle-orm";

const CategoriesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const categories = await db
    .select()
    .from(categoryTable)
    .where(eq(categoryTable.storeId, storeId))
    .orderBy(desc(categoryTable.createdAt));

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: item.createdAt ? format(item.createdAt, "MMMM do, yyyy") : "",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
