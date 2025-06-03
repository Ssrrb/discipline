export interface OrderTrendDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface ProductSalesData {
  name: string;
  sales: number;
}

export interface InventoryItem {
  product: string;
  stock: number;
}

export const orderTrendData: OrderTrendDataPoint[] = [
  { date: "2024-06-01", orders: 14, revenue: 240 },
  { date: "2024-06-02", orders: 20, revenue: 420 },
  { date: "2024-06-03", orders: 12, revenue: 210 },
  { date: "2024-06-04", orders: 18, revenue: 350 },
  { date: "2024-06-05", orders: 25, revenue: 500 },
  { date: "2024-06-06", orders: 30, revenue: 620 },
  { date: "2024-06-07", orders: 22, revenue: 410 },
];

export const topProducts: ProductSalesData[] = [
  { name: "Shirt", sales: 120 },
  { name: "Pants", sales: 90 },
  { name: "Hat", sales: 75 },
  { name: "Shoes", sales: 60 },
  { name: "Jacket", sales: 50 },
];

export const lowInventory: InventoryItem[] = [
  { product: "Shirt", stock: 3 },
  { product: "Hat", stock: 5 },
];
