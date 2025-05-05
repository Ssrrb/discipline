import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { storeTable } from "@/db/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { v4 as uuidv4 } from "uuid";

const db = drizzle(process.env.DATABASE_URL!);

export async function POST(req: Request) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new Response("Name is required", { status: 400 });
    }

    const store = await db.insert(storeTable).values({
      id: uuidv4(), // solo si tu tabla requiere esto
      name,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return new Response(JSON.stringify(store), { status: 201 });
  } catch (error) {
    console.log("[STORES_POST] error: ", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
