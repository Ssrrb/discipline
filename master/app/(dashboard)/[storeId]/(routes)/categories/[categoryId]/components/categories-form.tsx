"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import { categoryTable, storeTable } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useOrigin } from "@/hooks/use-origin";

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
 * Category Form Component Interface
 * @interface CategoryFormProps
 * @property {InferSelectModel<typeof categoryTable>} initialData - The initial category data
 * @description Defines the props for the CategoryForm component
 */
interface CategoryFormProps {
  initialData?: InferSelectModel<typeof categoryTable>;
  storeId: string;
}

/**
 * Form Validation Schema
 * @constant
 * @property {string} name - Category name with minimum length validation
 * @description Defines the validation rules for the category form
 */
const formSchema = z.object({
  name: z.string().min(3, "Category name must be at least 3 characters long"),
});

type CategoryFormValues = z.infer<typeof formSchema>;

/**
 * CategoryForm Component
 * @component
 * @param {CategoryFormProps} props - Component props
 * @description A form component for creating and updating category information.
 * Handles form submission, validation, and deletion of categories.
 *
 * @example
 * ```tsx
 * <CategoryForm initialData={category} />
 * ```
 *
 * @remarks
 * - Uses React Hook Form with Zod for form validation
 * - Integrates with the categories API for CRUD operations
 * - Includes delete confirmation modal
 */

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  storeId,
}) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData?.id;
  const title = isEdit ? "Edit category" : "Create category";
  const description = isEdit ? "Edit a category" : "Add a new category";
  const toastMessage = isEdit ? "Category updated." : "Category created.";
  const action = isEdit ? "Save changes" : "Create";

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setLoading(true);

      if (isEdit) {
        await axios.patch(
          `/api/stores/${storeId}/categories/${initialData.id}`,
          values
        );
      } else {
        await axios.post(`/api/stores/${storeId}/categories`, values);
      }

      router.refresh();
      router.push(`/${storeId}/categories`);
      toast.success(toastMessage);
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
  /**
   * Handles store deletion with proper error handling and navigation
   *
   * @remarks
   * - Redirects to root page after successful deletion
   * - Shows appropriate error message if deletion fails
   * - Closes the delete confirmation modal in all cases
   */
  const onDelete = async () => {
    if (!isEdit) return;

    try {
      setLoading(true);
      await axios.delete(`/api/${storeId}/categories/${initialData.id}`);
      router.refresh();
      router.push(`/${storeId}/categories`);
      toast.success("Category deleted.");
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(
          "Make sure you removed all products using this category first."
        );
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {isEdit && (
          <Button
            disabled={loading}
            variant="destructive"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
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
                      placeholder="Category name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your category name, and it&apos;s used by the
                    system.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};
