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