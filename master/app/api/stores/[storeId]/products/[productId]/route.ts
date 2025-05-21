import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { productTable, storeTable, imageTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";

// PATCH /api/stores/[storeId]/products/[productId]
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, stock, categoryId, images } = body;

    const { storeId, productId } = params;
    if (!storeId || !productId) {
      return NextResponse.json(
        { error: "Missing storeId or productId" },
        { status: 400 }
      );
    }

    // Validate fields
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Name must be at least 3 characters long" },
        { status: 400 }
      );
    }
    if (typeof description !== "string" || description.trim().length < 1) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }
    
    // Handle price conversion
    let priceValue: number;
    try {
      priceValue = typeof price === 'string' ? parseFloat(price) : Number(price);
      if (isNaN(priceValue) || priceValue < 0) {
        throw new Error('Invalid price');
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Handle stock
    const stockValue = Number(stock);
    if (isNaN(stockValue) || !Number.isInteger(stockValue) || stockValue < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative integer" },
        { status: 400 }
      );
    }

    // Handle categoryId (can be string, null, or undefined)
    if (categoryId !== null && categoryId !== undefined && typeof categoryId !== "string") {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Handle images
    if (!Array.isArray(images) || images.length < 1) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Verify all images have a URL
    if (!images.every(img => img && typeof img === 'object' && 'url' in img && typeof img.url === 'string')) {
      return NextResponse.json(
        { error: "Invalid image format" },
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

    // Verify the product exists and belongs to the store
    const [product] = await db
      .select()
      .from(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.storeId, storeId)
        )
      );
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update the product
    await db
      .update(productTable)
      .set({
        name,
        description,
        price: priceValue.toString(),
        stock: stockValue,
        categoryId: categoryId === "" ? null : categoryId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.storeId, storeId)
        )
      );

    // Replace images: delete old, insert new
    await db.delete(imageTable).where(eq(imageTable.productId, productId));
    if (images.length > 0) {
      await db.insert(imageTable).values(
        images.map((img: { url: string }) => ({
          url: img.url,
          productId,
          storeId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCTS_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[storeId]/products/[productId]
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { storeId, productId } = params;
    if (!storeId || !productId) {
      return NextResponse.json(
        { error: "Missing storeId or productId" },
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

    // Verify the product exists and belongs to the store
    const [product] = await db
      .select()
      .from(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.storeId, storeId)
        )
      );
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete the product (images will be deleted via cascade)
    await db
      .delete(productTable)
      .where(
        and(
          eq(productTable.id, productId),
          eq(productTable.storeId, storeId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PRODUCTS_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
