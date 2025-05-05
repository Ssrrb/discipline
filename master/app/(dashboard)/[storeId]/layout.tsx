import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db"; // Use shared instance

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId, redirectToSignIn } = await auth();

  // <-- return here so userId is now narrowed to string
  if (!userId) return redirectToSignIn();

  const [store] = await db
    .select()
    .from(storeTable)
    .where(eq(storeTable.userId, userId)) // ✅ userId is now string
    .limit(1);

  if (!store) redirect("/");
  if (store.id !== params.storeId) {
    redirect(`/${store.id}`);
  }

  return <div className="flex flex-col">{children}</div>;
}
