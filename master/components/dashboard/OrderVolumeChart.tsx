"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OrderTrendDataPoint } from "@/app/(dashboard)/[storeId]/(routes)/mock-data";

interface OrderVolumeChartProps {
  data: OrderTrendDataPoint[];
}

export function OrderVolumeChart({ data }: OrderVolumeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Volume</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} className="text-sm">
            <XAxis dataKey="date" className="fill-muted-foreground" />
            <YAxis allowDecimals={false} className="fill-muted-foreground" />
            <Tooltip wrapperClassName="!text-xs" />
            <Bar dataKey="orders" fill="hsl(var(--primary))" className="rounded" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
