import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db"; // Use shared instance
import Header from "@/components/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();

  // <-- return here so userId is now narrowed to string
  if (!userId) return redirectToSignIn();

  const [store] = await db
    .select()
    .from(storeTable)
    .where(eq(storeTable.userId, userId)) // ✅ userId is now string
    .limit(1);

  if (!store) {
    redirect("/");
  }

  return (
    <>
      <Header store={store} />
      {children}
    </>
  );
}
