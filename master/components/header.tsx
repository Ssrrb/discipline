import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import Navbar from "@/components/navbar";
import { Apple } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  store: {
    id: string;
    name: string;
    userId: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  } | null;
}

export default function Header({ store }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b shadow-sm">
      <div className="h-20 max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8">
        {/* Mobile Navigation - Left Side */}
        <div className="md:hidden">
          <MobileNav storeId={store?.id} />
        </div>

        {/* Logo - Center on Mobile, Left on Desktop */}
        <div className="flex items-center justify-center md:justify-start w-full">
          {/* Mobile Logo (Always Visible) */}
          <div className="md:hidden flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Apple className="text-red-500" size={24} />
              <span className="font-bold text-lg">IA Ceferina</span>
            </Link>
          </div>

          {/* Desktop Navigation with Logo */}
          <div className="hidden md:flex flex-1 items-center">
            <MainNav store={store} />
          </div>
        </div>

        {/* User Button - Right Side */}
        <Navbar />
      </div>
    </header>
  );
}
