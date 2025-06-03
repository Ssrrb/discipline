"use client";
import {
  orderTrendData,
  topProducts,
  lowInventory,
} from "./mock-data";
import { OrderVolumeChart } from "@/components/dashboard/OrderVolumeChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AOVCard } from "@/components/dashboard/AOVCard";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { InventoryAlert } from "@/components/dashboard/InventoryAlert";

const DashboardPage = () => {
  return (
    <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="md:col-span-2 lg:col-span-3">
        <InventoryAlert items={lowInventory} />
      </div>
      <OrderVolumeChart data={orderTrendData} />
      <RevenueChart data={orderTrendData} />
      <AOVCard data={orderTrendData} />
      <TopProductsChart data={topProducts} />
    </div>
  );
};

export default DashboardPage;
