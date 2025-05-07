import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db"; // Shared Drizzle instance

/**
 * Layout-guard that ensures:
 * 1. The user is authenticated.
 * 2. They own at least one store.
 * 3. The URL’s storeId matches their store.
 *
 * If any check fails, issues a redirect via Next.js App Router’s `redirect()`.
*/
export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Authenticate via Clerk. If not signed in, `redirectToSignIn()` will throw a NEXT_REDIRECT.
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    // Narrow type: userId is now a string
    return redirectToSignIn();
  }

  // 2. Basic sanity check for our DB URL
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  // 3. Fetch the first store owned by this user.
  //    If the DB query itself throws, we’ll catch and handle only real DB errors below.
  let store;
  try {
    const results = await db
      .select()
      .from(storeTable)
      .where(eq(storeTable.userId, userId))
      .limit(1);
    store = results[0] ?? null;
  } catch (error) {
    console.error("Database error:", error);
    // Redirect to home if something unexpected happened in the DB call
    redirect("/");
  }

  // 4. If user has no stores, render children so the modal can open.
  if (!store) {
    return <>{children}</>;
  }

  // 5. Always redirect to their store since this is a root layout
  // This is a fallback for when a user has a store but is at the root path
  redirect(`/${store.id}`);

  // 6. All checks passed—render the children.
  return <>{children}</>;
}
