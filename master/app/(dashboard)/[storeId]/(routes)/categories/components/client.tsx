"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { CategoryColumn } from "./columns.tsx";
import { columns } from "./columns.tsx";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

interface CategoryClientProps {
  data: CategoryColumn[];
}

export function CategoryClient({ data }: CategoryClientProps) {
  const router = useRouter();
  const params = useParams();
  return (
    <div className="flex-col space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-sm text-muted-foreground">
            Manage your store's categories
          </p>
        </div>
        <Button
          onClick={() => router.push(`/${params.storeId}/categories/new`)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading
        title={`Categories (${data.length})`}
        description="Manage for Categories"
      />
      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </div>
  );
}
