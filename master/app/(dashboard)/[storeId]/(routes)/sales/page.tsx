import { SalesForm } from "./components/sales-form";

const SalesPage = ({ params }: { params: { storeId: string } }) => {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SalesForm storeId={params.storeId} />
      </div>
    </div>
  );
};

export default SalesPage;
