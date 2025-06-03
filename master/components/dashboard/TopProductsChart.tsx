"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ProductSalesData } from "@/app/(dashboard)/[storeId]/(routes)/mock-data";

interface TopProductsChartProps {
  data: ProductSalesData[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" className="text-sm">
            <XAxis type="number" className="fill-muted-foreground" />
            <YAxis dataKey="name" type="category" width={80} className="fill-muted-foreground" />
            <Tooltip wrapperClassName="!text-xs" />
            <Bar dataKey="sales" fill="hsl(var(--primary))" className="rounded" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
