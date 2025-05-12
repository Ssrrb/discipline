import { db } from "@/lib/db";
import { categoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const CategoryPage = async ({ params }: { params: { categoryId: string } }) => {
  const category = await db
    .select()
    .from(categoryTable)
    .where(eq(categoryTable.id, params.categoryId))
    .limit(1);

  return (
    <div>
      <h1>ExistingCategory: {category[0]?.name}</h1>
    </div>
  );
};

export default CategoryPage;
