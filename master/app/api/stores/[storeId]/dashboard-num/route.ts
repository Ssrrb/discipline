// /app/api/stores/[storeId]/dashboard-num/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { storeTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    // 1. Auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    // 2. Body parsing & validation
    const { phone } = await req.json();
    if (typeof phone !== 'string' || phone.trim().length < 1) {
      return NextResponse.json(
        { error: 'A valid phone number is required' },
        { status: 400 }
      );
    }

    // 3. Correctly await params per Next.js 15+ change
    const { storeId } = await context.params;
    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    // 4. Update in Neon/Postgres via Drizzle
    const [updatedStore] = await db
      .update(storeTable)
      .set({
        phoneNumber: phone.trim(),
        updatedAt: new Date(),
      })
      .where(eq(storeTable.id, storeId))
      .returning();

    if (!updatedStore) {
      return NextResponse.json(
        { error: 'Store not found or not updated' },
        { status: 404 }
      );
    }

    // 5. Success
    return NextResponse.json({ success: true, store: updatedStore }, { status: 200 });
  } catch (error) {
    console.error('[DASHBOARD_NUM_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
