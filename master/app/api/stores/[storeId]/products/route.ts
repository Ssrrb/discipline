import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { productTable, storeTable, imageTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";

// POST /api/stores/[storeId]/products
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, stock, categoryId, images } = body;

    // Validate fields
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Invalid name—must be a string ≥ 3 chars" },
        { status: 400 }
      );
    }
    if (typeof description !== "string" || description.trim().length < 1) {
      return NextResponse.json(
        { error: "Invalid description—must be a non-empty string" },
        { status: 400 }
      );
    }
    if (
      typeof price !== "string" && typeof price !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid price—must be a string or number" },
        { status: 400 }
      );
    }
    const priceValue = typeof price === "string" ? parseFloat(price) : price;
    if (isNaN(priceValue) || priceValue < 0) {
      return NextResponse.json(
        { error: "Invalid price—must be a positive number" },
        { status: 400 }
      );
    }
    if (typeof stock !== "number" || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Invalid stock—must be a non-negative integer" },
        { status: 400 }
      );
    }
    if (categoryId && typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "Invalid categoryId—must be a string or null" },
        { status: 400 }
      );
    }
    if (!Array.isArray(images) || images.length < 1 || !images.every(img => typeof img.url === "string" && img.url.length > 0)) {
      return NextResponse.json(
        { error: "Invalid images—must be an array of objects with url" },
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

    // Create the product
    const [newProduct] = await db
      .insert(productTable)
      .values({
        name,
        description,
        price: priceValue.toString(),
        stock,
        categoryId: categoryId || null,
        storeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Insert images
    if (images.length > 0) {
      await db.insert(imageTable).values(
        images.map((img: { url: string }) => ({
          url: img.url,
          productId: newProduct.id,
          storeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
