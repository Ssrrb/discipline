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
  // New fields based on logs - mostly optional strings for now
  annulment_date: z.preprocess((arg) => (arg instanceof Date ? arg.toISOString().split('T')[0] : (typeof arg === 'string' && arg.trim() !== '' ? arg : null)), z.string().optional().nullable()),
  authorization_code: z.string().optional().nullable(),
  issuer_name: z.string().optional().nullable(),
  card_number_masked: z.string().optional().nullable(),
  customer_gender: z.string().optional().nullable(),
  customer_birth_date: z.preprocess((arg) => (arg instanceof Date ? arg.toISOString().split('T')[0] : (typeof arg === 'string' && arg.trim() !== '' ? arg : null)), z.string().optional().nullable()),
  transaction_origin: z.string().optional().nullable(),
  transaction_type: z.string().optional().nullable(),
  processor_name: z.string().optional().nullable(),
  device_type: z.string().optional().nullable(),
  iata_code: z.string().optional().nullable(),
  card_affinity: z.string().optional().nullable(),
  statement_number: z.string().optional().nullable(),
  vat_on_commission: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : String(val).replace(',', '.')),
    z.string().optional().nullable()
    .refine(s => s === null || s === undefined || (typeof s === 'string' && !isNaN(parseFloat(s))), { message: "IVA s/Comision debe ser un número válido" })
  ),
  deposit_account_code: z.string().optional().nullable(),
  bank_account_number: z.string().optional().nullable(),
  merchant_commission_rate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? null : String(val).replace(',', '.')),
    z.string().optional().nullable()
    .refine(s => s === null || s === undefined || (typeof s === 'string' && !isNaN(parseFloat(s))), { message: "Porcentaje de comision al comercio debe ser un número válido" })
  ),
  promotion_date: z.preprocess((arg) => (arg instanceof Date ? arg.toISOString().split('T')[0] : (typeof arg === 'string' && arg.trim() !== '' ? arg : null)), z.string().optional().nullable()),
  cash_register_id: z.string().optional().nullable(),
  transaction_service: z.string().optional().nullable(),
  service_description: z.string().optional().nullable(),
  service_code: z.string().optional().nullable(),
  service_code_description: z.string().optional().nullable(),
  additional_data: z.string().optional().nullable(),
  pre_authorization_slip: z.string().optional().nullable(),
  // Existing fields below
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
  // Mappings from logs
  "Fecha de anulada": "annulment_date",
  "Nro. transaccion": "transaction_number", // Note: This is different from "Nro. transacción"
  "Codigo autorizacion": "authorization_code",
  "Emisor": "issuer_name",
  "Nro. tarjeta": "card_number_masked",
  "Sexo": "customer_gender",
  "Fecha de nacimiento": "customer_birth_date",
  "Codigo de Sucursal": "branch_code", // Ensure exact match from log
  "Origen": "transaction_origin",
  "Tipo": "transaction_type",
  "Procesadora": "processor_name",
  "Dispositivo": "device_type",
  "Codigo Iata": "iata_code",
  "Afinidad": "card_affinity",
  "Nro. de resumen": "statement_number",
  "Monto de comision": "commission_amount", // Ensure exact match from log
  "IVA s/Comision": "vat_on_commission",
  // "Retencion RENTA" is already mapped to income_tax_withholding, ensure it's the exact string from log
  // "Retencion IVA" is already mapped to vat_withholding, ensure it's the exact string from log
  "Codigo de cuenta de la entidad de deposito": "deposit_account_code",
  "Nro. de cuenta del Banco": "bank_account_number",
  "Porcentaje de comision al comercio": "merchant_commission_rate",
  // "Fecha de credito del comercio" is already mapped to settlement_date, ensure it's the exact string from log
  "Fecha de la promocion": "promotion_date",
  "Caja": "cash_register_id",
  "Servicio de Transacción": "transaction_service",
  "Descripción del servicio": "service_description",
  "Prestación": "service_code",
  "Descripción de la prestación": "service_code_description",
  "Datos Adicionales": "additional_data",
  "Boleta Preautorización": "pre_authorization_slip",
  // Existing mappings below:
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

type RouteParams = { storeId: string };

export async function POST(
  req: NextRequest,
  context: { params: RouteParams | Promise<RouteParams> }
) {
  // Handle both direct params and Promise<params> for backward compatibility
  const params = 'then' in context.params ? await context.params : context.params;
  const { storeId } = params;
  try {
    // CRITICAL CHANGE: Await the auth() call
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { storeId } = params; // Directly get storeId from destructured params
    if (!storeId) {
      return NextResponse.json({ error: "Missing storeId from route parameters" }, { status: 400 });
    }
    
    // Verify the store exists and belongs to the user
    const [store] = await db
      .select()
      .from(storeTable)
      .where(
        and(
          eq(storeTable.id, storeId),
          eq(storeTable.userId, userId)
        )
      );

    if (!store) {
      return NextResponse.json({ error: "Store not found or access denied" }, { status: 404 });
    }

    // Directly process FormData as the primary expected format
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    // const formName = formData.get("name") as string | null; // If you also pass a 'name' field from the form

    if (!file) {
      return new NextResponse("No file uploaded in form data.", { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    let rawData: any[] = [];

    // Determine file type and parse accordingly
    if (file.name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/csv") {
      const csvData = Papa.parse(fileBuffer.toString("utf-8"), {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(), // Trim whitespace from headers
      });
      // Filter out rows that are completely empty after parsing
      rawData = csvData.data.filter(row => 
        Object.values(row as Record<string, any>).some(val => val !== null && String(val).trim() !== '')
      );
    } else if (file.name.endsWith(".xlsx") || file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // For XLSX, sheet_to_json with defval:null handles empty cells gracefully
      rawData = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null }); 
    } else {
      return new NextResponse(`Unsupported file type: ${file.type || 'unknown'}. Please upload a CSV or XLSX file.`, { status: 400 });
    }

    if (rawData.length === 0) {
        return NextResponse.json({ message: "File is empty or contains no data after initial parsing.", errors: [] }, { status: 400 });
    }

    const salesToInsert: (typeof salesTable.$inferInsert)[] = [];
    const errors: { row: number; messages: string[], originalData?: any }[] = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const mappedRow: any = {};
      let hasNonNullValueInRow = false;

      // Map CSV/XLSX headers to schema keys
      console.log(`[Row ${i+2}] Processing raw data:`, JSON.stringify(row));
      for (const rawHeaderKey in row) {
        const trimmedHeader = String(rawHeaderKey).trim();
        console.log(`[Row ${i+2}] Raw header: '${rawHeaderKey}', Trimmed: '${trimmedHeader}', Found in mapping: ${!!headerMapping[trimmedHeader]}`);
        if (headerMapping[trimmedHeader]) {
          const schemaKey = headerMapping[trimmedHeader];
          mappedRow[schemaKey] = row[rawHeaderKey];
          // Check if the original value (after potential string conversion and trim) has content
          if (row[rawHeaderKey] !== null && String(row[rawHeaderKey]).trim() !== ""){
            hasNonNullValueInRow = true;
          }
        }
      }
      
      // Skip effectively empty rows, especially for CSVs where empty lines might parse as objects with null/empty string values
      if (!hasNonNullValueInRow && (file.name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/csv")) {
        // Double check if all mapped values are null or empty strings
        const allValuesEffectivelyEmpty = Object.values(mappedRow).every(v => v === null || String(v).trim() === "");
        if(allValuesEffectivelyEmpty) continue;
      }

      // Ensure all Zod schema keys are present for validation, defaulting to undefined if not in mappedRow
      Object.keys(saleRecordSchema.shape).forEach(schemaKey => {
        if (!(schemaKey in mappedRow)) {
          mappedRow[schemaKey] = undefined; 
        }
      });

      const validationResult = saleRecordSchema.safeParse(mappedRow);

      if (validationResult.success) {
        const dataForDb = validationResult.data;
        salesToInsert.push({
          // Fields that exist in salesTable schema
          sale_date: dataForDb.sale_date,
          transaction_number: dataForDb.transaction_number,
          card_type: dataForDb.card_type,
          card_brand: dataForDb.card_brand,
          installments: dataForDb.installments,
          payment_plan: dataForDb.payment_plan,
          currency: dataForDb.currency,
          gross_amount: dataForDb.gross_amount,
          branch_code: dataForDb.branch_code,
          transaction_status: dataForDb.transaction_status,
          net_amount: dataForDb.net_amount,
          commission_amount: dataForDb.commission_amount,
          income_tax_withholding: dataForDb.income_tax_withholding,
          vat_withholding: dataForDb.vat_withholding,
          settlement_date: dataForDb.settlement_date,
          promo_discount: dataForDb.promo_discount,
          payment_method: dataForDb.payment_method,
          storeId: storeId, // Add storeId to the record
          // id, createdAt, updatedAt are typically handled by Drizzle/DB
        });
      } else {
        errors.push({
          row: i + 2, // Adding 2 for 1-based indexing + header row
          messages: validationResult.error.errors.map((e) => `${e.path.join(".")} - ${e.message}`),
          originalData: row // Include original row data for easier debugging on client or logs
        });
      }
    }

    console.log(`Finished processing all rows. errors.length: ${errors.length}, salesToInsert.length: ${salesToInsert.length}`);
    if (errors.length > 0) {
      return NextResponse.json({ message: "Validation errors occurred during processing. Please check the file content.", errors }, { status: 400 });
    }

    if (salesToInsert.length === 0) {
      return NextResponse.json({ message: "No valid data to insert. The file might be empty, all rows had errors, or all rows were filtered out as empty." }, { status: 400 });
    }

    // Perform database insertion
    await db.insert(salesTable).values(salesToInsert);

    return NextResponse.json({ message: `Successfully imported ${salesToInsert.length} sales records.` }, { status: 201 });

  } catch (error) {
    console.error("[SALES_UPLOAD_POST_ERROR]", error);
    if (error instanceof z.ZodError) {
      // This might catch Zod errors if any manual parsing outside safeParse throws them, though unlikely with current structure.
      return new NextResponse("A top-level Zod validation error occurred: " + error.flatten().formErrors.join(', '), { status: 400 });
    }
    // Handle specific error for body already used, often by middleware or incorrect request handling
    if (error instanceof Error && error.message.includes("Request body is already used")) {
        return new NextResponse("Internal Server Error: Failed to process request data. The request body might have been consumed by middleware.", { status: 500 });
    }
    // Generic internal server error for other cases
    return new NextResponse("Internal Server Error while processing sales upload.", { status: 500 });
  }
}
