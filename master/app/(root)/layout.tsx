import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db"; // Reuse shared instance

export default async function SetupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  // Extract the authenticated user's ID from the session using clerk
  const { userId, redirectToSignIn } = await auth();

  // <-- return here so userId is now narrowed to string
  if (!userId) return redirectToSignIn();
  if (!process.env.DATABASE_URL) throw new Error("Missing DB URL");

  try {
    const [store] = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.userId, userId))
      .limit(1);

    if (!store) redirect("/");
    if (params.storeId !== store.id) redirect(`/${store.id}`);
  } catch (error) {
    console.error("Database error:", error);
    redirect("/");
  }

  return <>{children}</>;
}
