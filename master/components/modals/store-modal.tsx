"use client";

import { useState } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/ui/modal";
import axios from "axios";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";

// Define and validate the structure of form data using Zod
const formSchema = z.object({
  name: z.string().min(1), // Store name must be non-empty
  description: z.string().min(1), // Description must be non-empty
  image: z.string().min(1), // Image URL or path must be non-empty
});

// StoreModal component for creating a new store via a modal form
export const StoreModal = () => {
  // Access modal control state (open/close) from the custom hook
  const storeModal = useStoreModal();

  // Track submission state to manage UI feedback
  const [loading, setLoading] = useState(false);

  // Setup form with schema validation and default field values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
    },
  });

  // Handle form submission asynchronously
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      // POST request to API route for store creation
      const response = await axios.post("/api/stores", values);
      console.log(response.data); // Log response for debugging
    } catch (error) {
      console.log(error); // Ideally replace with toast/error handler
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Modal
      title="Add store"
      description="Add a new store to manage products and categories"
      isOpen={storeModal.isOpen}
      onClose={storeModal.onClose}
    >
      <div>
        <div className="space-y-4 py-2 pb-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Name input field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Ecommerce store"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Form action buttons */}
              <div className="pt-6 space-x-2 items-center justify-end w-full">
                <Button
                  variant="outline"
                  onClick={storeModal.onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  Continue
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  );
};
