// app/api/store/[storeId]/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    // 1) Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // 2) Parse & validate payload
    const { name } = await req.json();
    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json(
        { error: "Invalid name—must be a string ≥ 3 chars" },
        { status: 400 }
      );
    }

    // 3) Validate route param
    const { storeId } = await params;
    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId" }, { status: 400 });
    }

    // 4) Fetch existing store
    const [existing] = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.id, storeId));

    if (!existing) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // 5) Ownership check
    if (existing.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 6) Perform the update
    await db
      .update(storeTable)
      .set({
        name: name.trim(),
        updatedAt: new Date(),
      })
      .where(eq(storeTable.id, storeId));

    // 7) Return success
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[STORE PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handles DELETE requests to delete a store.
 * 
 * @param req The incoming request object.
 * @param params The route parameters, including the store ID.
 * @returns A JSON response indicating success or error.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    // 1) Auth check - Ensure user is authenticated before proceeding
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    // 2) Validate store ID from URL parameters
    const storeId = params.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    // 3) Delete the store
    await db.delete(storeTable).where(eq(storeTable.id, storeId));

    // 4) Return success response
    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[STORE DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete store. Please try again." },
      { status: 500 }
    );
  }
}