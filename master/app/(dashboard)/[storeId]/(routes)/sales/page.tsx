import { SalesForm } from "./components/sales-form";

const SalesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SalesForm storeId={storeId} />
      </div>
    </div>
  );
};

export default SalesPage;
