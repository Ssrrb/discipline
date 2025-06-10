"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";
import { useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input"; // Assuming this is where shadcn-phone-input is installed
import { toast } from "sonner"; // Using Sonner for toasts
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// Zod schema for form validation
const FormSchema = z.object({
  phone: z.string().refine((value) => isValidPhoneNumber(value, "PY"), {
    message:
      "Invalid Paraguayan phone number. Please include +595 and ensure it's a valid number.",
  }),
});

// Sample data for pie charts (can be moved or fetched from API later)
const salesDistributionData = [
  { category: "Electronics", sales: 4500, fill: "var(--color-electronics)" },
  { category: "Apparel", sales: 3200, fill: "var(--color-apparel)" },
  { category: "Home Goods", sales: 2800, fill: "var(--color-homegoods)" },
  { category: "Books", sales: 1500, fill: "var(--color-books)" },
];

const salesChartConfig = {
  sales: { label: "Ventas ($)" },
  electronics: { label: "Vestido", color: "hsl(var(--chart-1))" },
  apparel: { label: "Remera", color: "hsl(var(--chart-2))" },
  homegoods: { label: "Pantalon", color: "hsl(var(--chart-3))" },
  books: { label: "Blusa", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

const userActivityData = [
  { status: "New Users", count: 120, fill: "var(--color-newusers)" },
  {
    status: "Returning Users",
    count: 350,
    fill: "var(--color-returningusers)",
  },
  { status: "Inactive Users", count: 50, fill: "var(--color-inactiveusers)" },
];

const activityChartConfig = {
  count: { label: "Conteo de Usuarios" },
  newusers: { label: "Nuevos Usuarios", color: "hsl(var(--chart-5))" },
  returningusers: { label: "Usuarios Regresivos", color: "hsl(var(--chart-1))" },
  inactiveusers: { label: "Usuarios Inactivos", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const DashboardPage = () => {
  const params = useParams<{ storeId: string }>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      phone: "+595", // Pre-fill with Paraguay country code
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoading(true);
      await axios.post(`/api/stores/${params.storeId}/dashboard-num`, {
        phone: data.phone,
      });
      toast.success("Phone number submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit phone number. Please try again.");
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      <header className="my-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Bienvenido a su hub de negocio
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Gestione su tienda, productos y analice el desempeño en un solo lugar.
        </p>
      </header>

      <Card className="w-full max-w-md mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Get Started</CardTitle>
          <CardDescription>
            Ingrese su numero de telefono para vincular su tienda o iniciar. ej: +595 981123456
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Paraguay)</FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        defaultCountry="PY"
                        placeholder="e.g., 981 123456"
                        // You can add more specific masking or formatting here if needed,
                        // but react-phone-number-input handles a lot automatically.
                      />
                    </FormControl>
                    <FormDescription>
                      Please enter your 9-digit mobile number (e.g., 981123456).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Phone Number"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="w-full max-w-5xl grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Analisis de Ventas</CardTitle>
            <CardDescription>
              Analisis de ventas por categoria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={salesChartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent hideLabel nameKey="category" />
                    }
                  />
                  <Pie
                    data={salesDistributionData}
                    dataKey="sales"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    // label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {salesDistributionData.map((entry) => (
                      <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="category" />}
                    className="-translate-y-[2px]"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Mayor cantidad en inventario</CardTitle>
            <CardDescription>Resumen de la actividad del inventario.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={activityChartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="status" />}
                  />
                  <Pie
                    data={userActivityData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                  >
                    {userActivityData.map((entry) => (
                      <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="-translate-y-[2px]"
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
        <p className="mt-1">Powered by Next.js, Shadcn/UI, and Recharts.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;
