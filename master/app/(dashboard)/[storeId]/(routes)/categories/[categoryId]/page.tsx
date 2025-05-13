import { format } from "date-fns";
import { db } from "@/lib/db";
import { categoryTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CategoryForm } from "./components/categories-form";

type CategoryColumn = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

interface PageProps {
  params: { storeId: string; categoryId: string };
}

const CategoryPage = async ({ params }: PageProps) => {
  const { storeId, categoryId } = await Promise.resolve(params);

  // Handle new category creation
  if (categoryId === 'new') {
    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <CategoryForm 
            initialData={{
              storeId: storeId,
              id: 'new',
              name: '',
              description: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }} 
          />
        </div>
      </div>
    );
  }

  // Validate UUID format
  const isValidUUID = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i.test(categoryId);
  
  if (!isValidUUID) {
    notFound();
  }

  try {
    const category = await db
      .select()
      .from(categoryTable)
      .where(
        and(
          eq(categoryTable.storeId, storeId),
          eq(categoryTable.id, categoryId)
        )
      )
      .then(res => res[0]); // Get first result

    if (!category) {
      notFound();
    }

    const formattedCategory: CategoryColumn = {
      id: category.id,
      name: category.name,
      description: category.description || "",
      createdAt: category.createdAt ? format(category.createdAt, "MMMM do, yyyy") : "",
    };

    return (
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">
              {formattedCategory.name}
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <p className="text-muted-foreground">
                {formattedCategory.description || "No description provided"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Created At</h3>
              <p className="text-muted-foreground">
                {formattedCategory.createdAt}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching category:', error);
    notFound();
  }

};

export default CategoryPage;
