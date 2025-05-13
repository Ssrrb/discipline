import { format } from "date-fns";
import { db } from "@/lib/db";
import { categoryTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { CategoryColumn } from "./components/columns";
import CategoriesPage from "./page";

export default async function CategoriesPageServer({
  params,
}: {
  params: { storeId: string };
}) {
  const { storeId } = params;
  
  const categories = await db
    .select()
    .from(categoryTable)
    .where(eq(categoryTable.storeId, storeId))
    .orderBy(desc(categoryTable.createdAt));

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    createdAt: item.createdAt ? format(item.createdAt, "MMMM do, yyyy") : "",
  }));

  return <CategoriesPage params={{ storeId }} />;
}
