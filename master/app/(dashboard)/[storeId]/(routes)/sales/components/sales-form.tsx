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
      // This case should ideally be caught by Zod validation
      toast.error("Please select a file.");
      return;
    }

    const file = values.file[0];
    setLoading(true);
    setProgress(0);
    setFileName(file.name); // Ensure filename is set on submit as well

    try {
      let parsedData: any[] = [];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      setProgress(10); // Initial progress

      if (fileExtension === "csv") {
        parsedData = await new Promise((resolve, reject) => {
          // Explicitly cast 'file' to 'any' to bypass the 'unique symbol' type error.
          // This is a workaround for a complex TypeScript typing issue with PapaParse.
          Papa.parse(file as any, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (result: Papa.ParseResult<any>) => {
              // The 'errors' array in result.meta can be checked here for row-level errors if needed
              if (result.errors && result.errors.length > 0) {
                console.warn("Row-level parsing errors:", result.errors);
                // Decide if these errors are critical enough to reject the promise
                // For now, we'll proceed but log them.
              }
              setProgress(50); // Progress after parsing
              resolve(result.data);
            },
            // Removed 'error' callback from config, will rely on Promise reject for critical errors.
          });
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Attempt to convert to JSON with headers
        parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (parsedData.length > 0) {
          const headers: string[] = (parsedData[0] as any[]).map(String); // Ensure headers are strings
          parsedData = parsedData.slice(1).map((row: any[]) => {
            let obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
        }
        setProgress(50); // Progress after parsing
      } else {
        // This case should also be caught by Zod validation based on file type
        toast.error("Unsupported file type. Please upload CSV or XLSX.");
        setLoading(false);
        setProgress(0);
        return;
      }

      if (parsedData.length === 0) {
        toast.error("The file is empty or could not be parsed correctly.");
        setLoading(false);
        setProgress(0);
        return;
      }

      setProgress(75); // Progress before API call

      // Example transformation based on memory (adjust to your actual needs)
      const dataToSend = parsedData.map((item) => ({
        ...item,
        price:
          item.price !== undefined && item.price !== null
            ? String(item.price)
            : undefined,
        categoryId: item.categoryId === "" ? null : item.categoryId,
        // Add other necessary transformations or validations here
      }));

      // Replace with your actual API endpoint
      await axios.post(`/api/stores/${storeId}/sales/route`, dataToSend);

      setProgress(100);
      toast.success("File processed and data uploaded successfully!");
      router.refresh();
      form.reset();
      setFileName(null);
    } catch (error: any) {
      setProgress(0);
      if (error.response?.data?.error) {
        toast.error(`API Error: ${error.response.data.error}`);
      } else if (error.message) {
        toast.error(`Processing Error: ${error.message}`);
      } else {
        toast.error("Something went wrong during file processing or upload.");
      }
      console.error("File processing error:", error);
    } finally {
      setLoading(false);
      // Keep progress at 100 if successful, otherwise reset or show error state
      if (progress !== 100) setProgress(0);
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
                          className="hidden" // Hide the actual file input
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
