import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { storeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps {
  params: {
    storeId: string;
  };
}
const SettingsPage: React.FC<SettingsPageProps> = async ({ params }) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const store = await db
    .select()
    .from(storeTable)
    .where(eq(storeTable.userId, userId))
    .limit(1);
  if (!store || store.length === 0) {
    redirect("/");
  }
  const storeData = store[0];
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={storeData} />
        {/*TODO: Add a component for the user to add its phone number and an API to send it to the database*/}
      </div>
    </div>
  );
};

export default SettingsPage;
