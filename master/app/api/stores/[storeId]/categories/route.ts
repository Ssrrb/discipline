import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { categoryTable, storeTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";

// POST /api/stores/[storeId]/categories
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { name } = await req.json();
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Invalid name—must be a string ≥ 3 chars" },
        { status: 400 }
      );
    }

    const { storeId } = params;
    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }

    // Verify the store exists and belongs to the user
    const [store] = await db
      .select()
      .from(storeTable)
      .where(
        and(
          eq(storeTable.id, storeId),
          eq(storeTable.userId, userId)
        )
      );

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Create the category
    const [newCategory] = await db
      .insert(categoryTable)
      .values({
        name,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/stores/[storeId]/categories/[categoryId]
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { name } = await req.json();
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Invalid name—must be a string ≥ 3 chars" },
        { status: 400 }
      );
    }

    const { storeId, categoryId } = params;
    if (!storeId || !categoryId) {
      return NextResponse.json(
        { error: "Missing storeId or categoryId" },
        { status: 400 }
      );
    }

    // Verify the store exists and belongs to the user
    const [store] = await db
      .select()
      .from(storeTable)
      .where(
        and(
          eq(storeTable.id, storeId),
          eq(storeTable.userId, userId)
        )
      );

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Verify the category exists and belongs to the store
    const [category] = await db
      .select()
      .from(categoryTable)
      .where(
        and(
          eq(categoryTable.id, categoryId),
          eq(categoryTable.storeId, storeId)
        )
      );

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Update the category
    await db
      .update(categoryTable)
      .set({ 
        name,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(categoryTable.id, categoryId),
          eq(categoryTable.storeId, storeId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORIES_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[storeId]/categories/[categoryId]
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { storeId, categoryId } = params;
    if (!storeId || !categoryId) {
      return NextResponse.json(
        { error: "Missing storeId or categoryId" },
        { status: 400 }
      );
    }

    // Verify the store exists and belongs to the user
    const [store] = await db
      .select()
      .from(storeTable)
      .where(
        and(
          eq(storeTable.id, storeId),
          eq(storeTable.userId, userId)
        )
      );

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Verify the category exists and belongs to the store
    const [category] = await db
      .select()
      .from(categoryTable)
      .where(
        and(
          eq(categoryTable.id, categoryId),
          eq(categoryTable.storeId, storeId)
        )
      );

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete the category
    await db
      .delete(categoryTable)
      .where(
        and(
          eq(categoryTable.id, categoryId),
          eq(categoryTable.storeId, storeId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORIES_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
