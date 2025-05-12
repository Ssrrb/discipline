import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { categoryTable, storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { categoryId: string } }
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

    const { categoryId } = params;
    if (!categoryId) {
      return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });
    }

    const [category] = await db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.id, String(categoryId)));

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const [store] = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.id, String(category.storeId)));

    if (!store || store.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!store || store.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .update(categoryTable)
      .set({ name })
      .where(eq(categoryTable.id, String(categoryId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORIES_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { categoryId } = params;
    if (!categoryId) {
      return NextResponse.json({ error: "Missing categoryId" }, { status: 400 });
    }

    const [category] = await db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.id, String(categoryId)));

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const [store] = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.id, String(category.storeId)));

    if (!store || store.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!store || store.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(categoryTable).where(eq(categoryTable.id, String(categoryId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORIES_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
