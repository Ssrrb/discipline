"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState, ChangeEvent, useRef } from "react"; // Added useRef
import * as Papa from "papaparse";
import * as XLSX from "xlsx";
import { UploadCloud } from "lucide-react"; // Added for icon

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Sales record name must be at least 3 characters." }),
  file: z
    .custom<FileList>(
      (val) => {
        // Check if running in a browser environment where FileList is defined
        if (typeof window !== "undefined") {
          return val instanceof FileList;
        }
        // During SSR or build, FileList won't be defined.
        // We can return true here as the actual file input handling is client-side.
        // Subsequent refines will still operate on the client.
        return true;
      },
      {
        message: "Expected a file upload.", // Generic message, specific errors handled by refines
      }
    )
    .refine((files) => files?.length === 1, "A file is required.")
    .refine((files) => {
      const file = files?.[0];
      if (!file) return false; // Should be caught by length check
      const acceptedTypes = [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      return acceptedTypes.includes(file.type);
    }, "Invalid file type. Please upload a CSV or XLSX file.")
    .refine((files) => {
      const file = files?.[0];
      if (!file) return false;
      return file.size <= 5 * 1024 * 1024; // 5MB size limit
    }, "File size must be less than 5MB.")
    .optional(), // Make the file field optional to handle form reset
});

type SalesFormValues = z.infer<typeof formSchema>;

interface SalesFormProps {
  storeId: string;
}

export const SalesForm: React.FC<SalesFormProps> = ({ storeId }) => {
  const router = useRouter();
  const params = useParams(); // storeId is also available via params.storeId
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      // file: undefined, // Zod optional handles this
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
      form.setValue("file", files, { shouldValidate: true });
    } else {
      setFileName(null);
      form.setValue("file", undefined, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: SalesFormValues) => {
    if (!values.file || values.file.length === 0) {
      toast.error("Please select a file.");
      return;
    }

    const file = values.file[0];
    setLoading(true);
    setProgress(0);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("file", file);

    try {
      await axios.post(`/api/stores/${storeId}/sales`, formData, {
        headers: {
          // Axios will set 'Content-Type': 'multipart/form-data' automatically
          // when it detects a FormData object as the payload.
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          } else {
            // Fallback for when total size is not available
            // This provides some feedback but won't be an accurate percentage
            // You might want to handle this differently, e.g., show an indeterminate loader
            // or a simpler message like "Uploading..."
            // For now, we'll increment progress slowly up to a point.
            setProgress((prev) => (prev < 90 ? prev + 5 : 90));
          }
        },
      });

      // If onUploadProgress doesn't reach 100% (e.g. if total is not available),
      // ensure it's set to 100% on success.
      setProgress(100);
      toast.success("File uploaded successfully! Backend processing started.");
      router.refresh(); // Refresh to see changes if any are immediately reflected
      // router.push(`/${storeId}/sales`); // Or navigate to a relevant page
      form.reset(); // Reset the form fields
      setFileName(null); // Clear the displayed file name
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the actual file input element
      }
    } catch (error: any) {
      setProgress(0); // Reset progress on error
      if (error.response?.data?.error) {
        toast.error(`Upload Error: ${error.response.data.error}`);
      } else if (error.message) {
        toast.error(`Upload Error: ${error.message}`);
      } else {
        toast.error("Something went wrong during file upload.");
      }
      console.error("File upload error:", error);
    } finally {
      setLoading(false);
      // If an error occurred before completion, progress might not be 100.
      // Resetting to 0 unless it was successful.
      if (progress !== 100 && !loading) {
        // Check !loading because setLoading(false) is in finally
        // and we only want to reset if it wasn't a success.
        // A more robust way would be a success flag.
      }
      // If successful, progress is already 100. If error, it's reset to 0.
      // If still loading (which shouldn't happen here), keep current progress.
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Heading
          title="Upload Sales Data"
          description="Process CSV or XLSX files for sales entries."
        />
      </div>
      <Separator />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Select a CSV or XLSX file (max 5MB). Ensure it has appropriate
            headers (e.g., productName, quantity, price, date, categoryId).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Record Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="e.g., Q4 Campaign Sales, October Week 1"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this batch of sales data.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales File</FormLabel>
                    <FormControl>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                          className="w-full sm:w-auto"
                        >
                          <UploadCloud className="mr-2 h-4 w-4 flex-shrink-0" />
                          Choose File
                        </Button>
                        <Input
                          type="file"
                          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                          disabled={loading}
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                        {fileName && !form.formState.errors.file && (
                          <span
                            className="text-sm text-muted-foreground truncate"
                            title={fileName}
                          >
                            Selected: {fileName}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loading && (
                <div className="space-y-2 pt-4">
                  <Progress
                    value={progress}
                    className="w-full [&>*]:bg-primary"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress < 100
                      ? `Processing: ${progress}%`
                      : "Upload Complete!"}
                  </p>
                </div>
              )}
              <Button
                disabled={loading || !form.formState.isValid}
                className="ml-auto w-full sm:w-auto"
                type="submit"
              >
                {loading ? "Processing..." : "Upload and Process File"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
