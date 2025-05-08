import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlignJustify, Apple } from "lucide-react";
import Link from "next/link";
import { navigationConfig, DEFAULT_APP_ICON } from "@/components/navigation/navigation-config";

interface MobileNavProps {
  storeId: string | null | undefined;
}

export function MobileNav({ storeId }: MobileNavProps) {
  const items = navigationConfig.mobile(storeId);

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger>
          <AlignJustify />
        </SheetTrigger>
        <SheetContent side="left">
          <Link href="/" className="flex items-center gap-2">
            <Apple className="text-red-500" />
            <span className="sr-only">Discipline</span>
          </Link>
          <nav className="flex flex-col gap-3 lg:gap-4 mt-6">
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
