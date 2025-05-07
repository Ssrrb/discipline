import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { storeTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  // 1. Authenticate
  const authResult = await auth();
  if (!authResult.userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 2. Parse & validate body
  const { name } = await req.json();
  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  // 3. Insert & get back the full row
  const [store] = await db
    .insert(storeTable)
    .values({
      name,
      userId: authResult.userId
    })
    .returning();    // ← returns the inserted row including id & timestamps

  // 4. Return JSON
  return NextResponse.json(store, { status: 201 });
}
