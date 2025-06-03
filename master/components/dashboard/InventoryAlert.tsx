"use client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type { InventoryItem } from "@/app/(dashboard)/[storeId]/(routes)/mock-data";

interface InventoryAlertProps {
  items: InventoryItem[];
}

export function InventoryAlert({ items }: InventoryAlertProps) {
  if (items.length === 0) return null;
  return (
    <Alert variant="destructive">
      <AlertTitle>Low Stock</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 space-y-1">
          {items.map((item) => (
            <li key={item.product}>
              {item.product}: {item.stock} left
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
