"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ProductColumn } from "./columns";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface ProductClientProps {
  data: ProductColumn[];
}

export function ProductClient({ data }: ProductClientProps) {
  const router = useRouter();
  const params = useParams();
  
  return (
    <div className="flex-col space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading 
            title={`Products (${data.length})`} 
            description="Manage products for your store" 
          />
        </div>
        <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable 
        searchKey="name" 
        columns={columns} 
        data={data} 
      />
      <Heading title="API" description="API endpoints for products" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </div>
  );
}
