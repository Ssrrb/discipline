import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlignJustify, Apple } from "lucide-react";
import Link from "next/link";

export function MobileNav() {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger>
          <AlignJustify />
        </SheetTrigger>
        <SheetContent side="left">
          <Link href="/">
            <Apple className="text-red-500" />
          </Link>
          <nav className="flex flex-col gap-3 lg:gap-4 mt-6">
            <Link href="/project">StoreName!</Link>
            <Link href="/about">Settings</Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
