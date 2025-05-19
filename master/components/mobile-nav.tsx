import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlignJustify } from "lucide-react";
import Link from "next/link";
import { navigationConfig } from "@/components/navigation/navigation-config";
import { DialogTitle } from "@radix-ui/react-dialog";

interface MobileNavProps {
  storeId: string | null | undefined;
}

export function MobileNav({ storeId }: MobileNavProps) {
  const items = navigationConfig.mobile(storeId, null);

  return (
    <Sheet>
      {/* Mobile menu button */}
      <SheetTrigger className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors">
        <AlignJustify size={22} className="text-gray-700" />
      </SheetTrigger>

      {/* Slide-out menu panel */}
      <SheetContent
        side="left"
        className="w-72 max-w-full h-full p-6 bg-white border-r shadow-lg"
      >
        <DialogTitle className="text-lg font-semibold mb-4">Menu</DialogTitle>

        {/* Navigation links */}
        <nav className="flex flex-col gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2.5 px-3.5 rounded-md hover:bg-gray-100 transition-colors flex items-center font-medium text-gray-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
