import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { categoryTable, storeTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CategoryForm } from "./components/categories-form";

interface PageProps {
  params: {
    storeId: string;
    categoryId: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * Category Page Component
 * @description Server component that handles both creating a new category and editing an existing one
 * @param {PageProps} props - Component props
 * @returns {Promise<JSX.Element>} The category form page
 */
export default async function CategoryPage({ params }: PageProps) {
  // Await and destructure params
  const { storeId, categoryId } = await params;

  // Handle new category case
  if (categoryId === "new") {
    // Verify the store exists
    const store = await db.query.storeTable.findFirst({
      where: eq(storeTable.id, storeId),
    });

    if (!store) {
      notFound();
    }

    return (
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          <CategoryForm storeId={storeId} />
        </div>
      </div>
    );
  }

  // Handle edit category case
  try {
    // Validate UUID format before querying the database
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        categoryId
      )
    ) {
      notFound();
    }
    // Fetch category data
    const category = await db.query.categoryTable.findFirst({
      where: and(
        eq(categoryTable.id, categoryId),
        eq(categoryTable.storeId, storeId)
      ),
    });

    // Return 404 if category doesn't exist
    if (!category) {
      notFound();
    }

    return (
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          <CategoryForm initialData={category} storeId={storeId} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in CategoryPage:", error);
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn't load the category. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
