import { auth } from "@clerk/nextjs/server";
import { storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(JSON.stringify({ storeName: null }), {
        status: 401,
      });
    }

    const [store] = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.userId, userId))
      .limit(1);

    return new Response(JSON.stringify({ storeName: store?.name || null }));
  } catch (error) {
    console.error("Error fetching store name:", error);
    return new Response(JSON.stringify({ storeName: null }), {
      status: 500,
    });
  }
}
