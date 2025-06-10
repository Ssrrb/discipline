// /app/api/stores/[storeId]/dashboard-num/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { db } from '@/lib/db';
import { storeTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST handler to update a store's phone number.
 * This endpoint is protected and requires user authentication.
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId:string } }
) {
  try {
    // 1. Authentication & Authorization
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    // 2. Route Parameter Validation
    // The `params` object is passed directly from Next.js file-based routing.
    // It does not need to be awaited. `storeId` is available synchronously.
    const { storeId } = params;
    if (!storeId) {
      return new NextResponse('Store ID is required', { status: 400 });
    }

    // 3. Request Body Parsing and Validation
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string' || phone.trim().length < 1) {
      return new NextResponse('A valid phone number is required', { status: 400 });
    }

    // 4. Verify Store Existence and Ownership
    // First, check if a store with the given ID exists.
    const [existingStore] = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.id, storeId));

    if (!existingStore) {
      return new NextResponse('Store not found', { status: 404 });
    }

    // Second, confirm the authenticated user owns this store.
    if (existingStore.userId !== userId) {
      return new NextResponse('Forbidden: You do not have access to this store', { status: 403 });
    }

    // 5. Database Update
    // With all checks passed, update the phone number and `updatedAt` timestamp.
    const [updatedStore] = await db
      .update(storeTable)
      .set({
        phoneNumber: phone.trim(),
        updatedAt: new Date(),
      })
      .where(eq(storeTable.id, storeId))
      .returning(); // Drizzle's returning() method provides the updated record.

    // 6. Success Response
    // Return the updated store object to the client.
    return NextResponse.json(updatedStore);

  } catch (error) {
    // 7. Error Handling
    console.error('[DASHBOARD_NUM_POST_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
