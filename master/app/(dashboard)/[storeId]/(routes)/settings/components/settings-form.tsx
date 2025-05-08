"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { storeTable } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";

//storeTable is a value, not a type.

interface SettingsFormProps {
  initialData: InferSelectModel<typeof storeTable>;
}
//Note: InferSelectModel<typeof storeTable> is a Drizzle helper that infers the TypeScript type of a row selected from storeTable
const formSchema = z.object({
  name: z.string().min(3),
});
type SettingsFormValues = z.infer<typeof formSchema>;
export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Settings" description="Manage store preferences" />
        {/*Button to delete store */}
        <Button variant="destructive" size="icon" onClick={() => {}}>
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
    </>
  );
};
