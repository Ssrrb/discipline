"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

import {
  productTable,
  categoryTable,
  imageTable,
  storeTable,
} from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useOrigin } from "@/hooks/use-origin";
import ImageUpload from "@/components/ui/image-upload";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/alert-modal";

type Category = InferSelectModel<typeof categoryTable>;
type Image = InferSelectModel<typeof imageTable>;

interface ProductFormProps {
  initialData?:
    | (InferSelectModel<typeof productTable> & {
        images: Image[];
        category?: Category | null;
      })
    | undefined;
  categories: Category[];
  storeId: string;
}

const formSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters long"),
  description: z.string().min(1, "Description is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  stock: z.coerce
    .number()
    .int()
    .min(0, "Stock must be a non-negative integer."),
  categoryId: z.string().uuid("Invalid category ID.").nullable(),
  images: z
    .object({ url: z.string() })
    .array()
    .min(1, "At least one image is required."),
});

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  storeId,
}) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData?.id;
  const title = isEdit ? "Edit product" : "Create product";
  const description = isEdit ? "Edit a product" : "Add a new product";
  const toastMessage = isEdit ? "Product updated." : "Product created.";
  const action = isEdit ? "Save changes" : "Create";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: parseFloat(String(initialData.price)),
          images: initialData.images || [],
          categoryId: initialData.categoryId || null,
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          categoryId: null,
          images: [],
        },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        price: data.price.toString(), // Ensure price is a string
        stock: Number(data.stock), // Ensure stock is a number
        categoryId: data.categoryId || null, // Ensure categoryId is either a string or null
      };

      if (initialData) {
        // Update existing product
        await axios.patch(
          `/api/stores/${storeId}/products/${initialData.id}`,
          payload
        );
      } else {
        // Create new product
        await axios.post(`/api/stores/${storeId}/products`, payload);
      }

      router.refresh();
      router.push(`/${storeId}/products`);
      toast.success(toastMessage);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!isEdit || !initialData?.id) return;

    try {
      setLoading(true);
      await axios.delete(`/api/stores/${storeId}/products/${initialData.id}`);
      router.refresh();
      router.push(`/${storeId}/products`);
      toast.success("Product deleted.");
    } catch (error: any) {
      if (
        error.response?.data?.error?.includes("violates foreign key constraint")
      ) {
        toast.error(
          "Make sure you removed all related data using this product first."
        );
      } else if (error.response?.status === 400) {
        toast.error(
          "Make sure you removed all products using this product first."
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

      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value.map((image) => image.url)}
                    disabled={loading}
                    onChange={(urls) =>
                      field.onChange(urls.map((url) => ({ url })))
                    }
                    onRemove={(urlToRemove: string) =>
                      field.onChange(
                        field.value.filter(
                          (currentImage) => currentImage.url !== urlToRemove
                        )
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This is your product name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Product description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={(value) => {
                      // Convert "no-category" to null for the form
                      field.onChange(value === "no-category" ? null : value);
                    }}
                    value={field.value || "no-category"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Use "no-category" as a non-empty placeholder value */}
                      <SelectItem value="no-category">No Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id || ""}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
