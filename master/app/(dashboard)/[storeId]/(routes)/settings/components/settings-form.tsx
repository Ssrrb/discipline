"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import { storeTable } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { eq } from "drizzle-orm";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

/**
 * Component Props Interface
 * @property initialData - The initial data for the form, inferred from the store table schema
 * @remarks Uses Drizzle's InferSelectModel to automatically generate TypeScript types from the database schema
 */
interface SettingsFormProps {
  initialData: InferSelectModel<typeof storeTable>;
}

/**
 * Zod schema for form validation
 * @property name - Store name must be at least 3 characters long
 */
const formSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters long"),
});

type SettingsFormValues = z.infer<typeof formSchema>;

/**
 * SettingsForm Component
 * @component
 * @param {SettingsFormProps} props - Component props
 * @param {InferSelectModel<typeof storeTable>} props.initialData - Initial form data from store table
 * @description This component provides a form interface for managing store settings
 * @remarks Uses React Hook Form with Zod validation for robust form handling
 */

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `/api/stores/${initialData.id}`,
        values
      );
      toast.success("Store updated successfully");
      router.refresh();
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {}}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        {/* Main heading section */}
        <Heading title="Settings" description="Manage store preferences" />

        {/* Delete store button - TODO: Implement delete functionality */}
        <Button
          variant="destructive"
          size="icon"
          className="cursor-pointer hover:text-destructive"
          onClick={() => {
            setOpen(true);
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      {/* Visual separator between header and form content */}
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Store name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your store name, and it&apos;s used by the system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
    </>
  );
};
