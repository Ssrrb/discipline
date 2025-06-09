import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { db } from "@/lib/db"; // Corrected DB import path
import { salesTable, storeTable } from "@/db/schema"; // Corrected schema imports
import { auth } from "@clerk/nextjs/server"; // Using auth for userId
import { eq, and } from "drizzle-orm";

// Define the Zod schema for a single sale record
const saleRecordSchema = z.object({
  sale_date: z.preprocess((arg) => {
    if (!arg) return null;
    if (arg instanceof Date) return arg;
    if (typeof arg === "string") {
      const parts = arg.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            if (month > 12 && day <= 12) { return new Date(year, month - 1, day); }
            else if (day > 12 && month <=12) { return new Date(year, month - 1, day); }
            else if (day <= 12 && month <= 12) { return new Date(year, month - 1, day); }
        }
      }
      const parsedDate = new Date(arg);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
    return undefined; 
  }, z.date({ required_error: "Fecha de venta es requerida" })),
  transaction_number: z.string({
    required_error: "Nro. transacción es requerido",
  }).min(1, "Nro. transacción no puede estar vacío"),
  card_type: z.string().optional().nullable(),
  card_brand: z.string().optional().nullable(),
  installments: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : parseInt(String(val), 10)),
    z.number().int().optional().nullable()
  ),
  payment_plan: z.string().optional().nullable(),
  currency: z.string({ required_error: "Moneda es requerida" }).min(1, "Moneda no puede estar vacía"),
  gross_amount: z.preprocess(
    // For required numeric strings, return undefined if input is empty/null to trigger Zod's required check
    (val) => (val === "" || val === null || val === undefined ? undefined : String(val).replace(',', '.')),
    z.string({ required_error: "Importe es requerido", invalid_type_error: "Importe debe ser un valor de texto" })
     .refine(s => typeof s === 'string' && !isNaN(parseFloat(s)), { message: "Importe debe ser un número válido" })
  ),
  branch_code: z.string().optional().nullable(),
  transaction_status: z.string({ required_error: "Estado es requerido" }).min(1, "Estado no puede estar vacío"),
  net_amount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : String(val).replace(',', '.')),
    z.string().optional().nullable()
     .refine(s => s === null || s === undefined || (typeof s === 'string' && !isNaN(parseFloat(s))), { message: "Importe Neto debe ser un número válido" })
  ),
  commission_amount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : String(val).replace(',', '.')),
    z.string().optional().nullable()
    .refine(s => s === null || s === undefined || (typeof s === 'string' && !isNaN(parseFloat(s))), { message: "Monto de comisión debe ser un número válido" })
  ),
  income_tax_withholding: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : String(val).replace(',', '.')),
    z.string().optional().nullable()
    .refine(s => s === null || s === undefined || (typeof s === 'string' && !isNaN(parseFloat(s))), { message: "Retención RENTA debe ser un número válido" })
  ),
  vat_withholding: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : String(val).replace(',', '.')),
    z.string().optional().nullable()
    .refine(s => s === null || s === undefined || (typeof s === 'string' && !isNaN(parseFloat(s))), { message: "Retención IVA debe ser un número válido" })
  ),
  settlement_date: z.preprocess((arg) => {
    if (!arg) return null;
    if (arg instanceof Date) return arg;
    if (typeof arg === "string") {
      const parts = arg.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            if (month > 12 && day <= 12) { return new Date(year, month - 1, day); }
            else if (day > 12 && month <=12) { return new Date(year, month - 1, day); }
            else if (day <= 12 && month <= 12) { return new Date(year, month - 1, day); }
        }
      }
      const parsedDate = new Date(arg);
      if (!isNaN(parsedDate.getTime())) return parsedDate;
    }
    return undefined; 
  }, z.date().optional().nullable()),
  promo_discount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : String(val).replace(',', '.')),
    z.string().optional().nullable()
    .refine(s => s === null || s === undefined || (typeof s === 'string' && !isNaN(parseFloat(s))), { message: "Descuento Promo debe ser un número válido" })
  ),
  payment_method: z.string().optional().nullable(),
});

type SaleRecord = z.infer<typeof saleRecordSchema>;

const headerMapping: { [key: string]: keyof SaleRecord } = {
  "Fecha de venta": "sale_date",
  "Nro. transacción": "transaction_number",
  "Nro Transacción": "transaction_number",
  "Tipo de tarjeta": "card_type",
  "Marca": "card_brand",
  "Cuotas": "installments",
  "Plan de pago": "payment_plan",
  "Moneda": "currency",
  "Importe": "gross_amount",
  "Sucursal o Código de Sucursal": "branch_code",
  "Código de Sucursal": "branch_code",
  "Sucursal": "branch_code",
  "Estado": "transaction_status",
  "Importe Neto": "net_amount",
  "Monto de comisión": "commission_amount",
  "Retención RENTA": "income_tax_withholding",
  "Retención IVA": "vat_withholding",
  "Fecha de crédito del comercio": "settlement_date",
  "Descuento Promo": "promo_discount",
  "Medio de pago": "payment_method",
};

export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const storeId = params.storeId;
    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    // Verify user owns the store
    const [store] = await db
      .select({ id: storeTable.id, userId: storeTable.userId })
      .from(storeTable)
      .where(and(eq(storeTable.id, storeId), eq(storeTable.userId, userId)));

    if (!store) {
      return new NextResponse("Forbidden: Store not found or you do not own this store", { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let rawData: any[] = [];

    if (file.name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/csv") {
      const csvData = Papa.parse(fileBuffer.toString("utf-8"), {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(), // Trim header spaces
      });
      rawData = csvData.data.filter(row => Object.values(row as Record<string, any>).some(val => val !== null && val !== '')); // Filter out completely empty rows
    } else if (file.name.endsWith(".xlsx") || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true }); // cellDates: true helps with date parsing
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null }); // raw: false for formatted strings, defval for empty cells
    } else {
      return new NextResponse(`Unsupported file type: ${file.type || 'unknown'}. Please upload a CSV or XLSX file.`, { status: 400 });
    }

    if (rawData.length === 0) {
        return NextResponse.json({ message: "File is empty or contains no data.", errors: [] }, { status: 400 });
    }

    const salesToInsert: (typeof salesTable.$inferInsert)[] = [];
    const errors: { row: number; messages: string[], originalData?: any }[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const mappedRow: any = {};
      let hasNonNullValue = false;

      for (const rawHeaderKey in row) {
        const trimmedHeader = rawHeaderKey.trim();
        if (headerMapping[trimmedHeader]) {
          const schemaKey = headerMapping[trimmedHeader];
          mappedRow[schemaKey] = row[rawHeaderKey]; // Keep original value for Zod to preprocess
          if (row[rawHeaderKey] !== null && row[rawHeaderKey] !== ""){
            hasNonNullValue = true;
          }
        }
      }
      
      // Skip row if it only contained null/empty string values after mapping (likely an empty line in CSV)
      if (!hasNonNullValue && (file.name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/csv")) {
        // For XLSX, sheet_to_json with defval:null handles this better, so only apply this heuristic for CSV
        const allValuesNullOrEmpty = Object.values(mappedRow).every(v => v === null || v === "");
        if(allValuesNullOrEmpty) continue;
      }

      // Ensure all Zod schema keys are present, defaulting to undefined if not in mappedRow, so Zod can process them
      Object.keys(saleRecordSchema.shape).forEach(schemaKey => {
        if (!(schemaKey in mappedRow)) {
          mappedRow[schemaKey] = undefined; 
        }
      });

      const validationResult = saleRecordSchema.safeParse(mappedRow);

      if (validationResult.success) {
        salesToInsert.push({
          ...validationResult.data,
          storeId: storeId,
          // Drizzle handles createdAt/updatedAt
        });
      } else {
        errors.push({
          row: i + 2, // Adding 2 for 1-based indexing + header row
          messages: validationResult.error.errors.map((e) => `${e.path.join(".")} - ${e.message}`),
          originalData: row
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ message: "Validation errors occurred during processing.", errors }, { status: 400 });
    }

    if (salesToInsert.length === 0) {
      return NextResponse.json({ message: "No valid data to insert. The file might be empty or all rows had errors after validation." }, { status: 400 });
    }

    await db.insert(salesTable).values(salesToInsert);

    return NextResponse.json({ message: `Successfully imported ${salesToInsert.length} sales records.` }, { status: 201 });

  } catch (error) {
    console.error("[SALES_UPLOAD_POST_ERROR]", error);
    if (error instanceof z.ZodError) {
      // This case should ideally be caught by row-level safeParse, but as a fallback
      return new NextResponse("A top-level validation error occurred: " + error.flatten().formErrors.join(', '), { status: 400 });
    }
    // Handle other potential errors, e.g., file read errors, database errors
    return new NextResponse("Internal Server Error while processing the file.", { status: 500 });
  }
}
