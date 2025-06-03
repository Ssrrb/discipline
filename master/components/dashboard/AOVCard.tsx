"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OrderTrendDataPoint } from "@/app/(dashboard)/[storeId]/(routes)/mock-data";
import { ResponsiveContainer, LineChart, Line } from "recharts";

interface AOVCardProps {
  data: OrderTrendDataPoint[];
}

export function AOVCard({ data }: AOVCardProps) {
  const totalOrders = data.reduce((acc, d) => acc + d.orders, 0);
  const totalRevenue = data.reduce((acc, d) => acc + d.revenue, 0);
  const aov = totalOrders ? totalRevenue / totalOrders : 0;

  const sparkData = data.map((d) => ({ date: d.date, value: d.revenue / d.orders }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Order Value</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{aov.toFixed(2)}</div>
        <div className="h-24 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
