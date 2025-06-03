"use client";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OrderTrendDataPoint } from "@/app/(dashboard)/[storeId]/(routes)/mock-data";

interface RevenueChartProps {
  data: OrderTrendDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Revenue</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} className="text-sm">
            <XAxis dataKey="date" className="fill-muted-foreground" />
            <YAxis className="fill-muted-foreground" />
            <Tooltip wrapperClassName="!text-xs" />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
