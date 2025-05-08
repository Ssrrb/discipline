import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import Navbar from "@/components/navbar";

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
      <div className="h-20 max-w-7xl mx-auto flex items-center px-4 md:px-8">
        {/* Desktop Navigation */}
        <div className="flex-1 flex items-center">
          <MainNav store={store} />
        </div>
        {/* Mobile Navigation */}
        <div className="flex md:hidden flex-1">
          <MobileNav storeId={store?.id} />
        </div>
        {/* User Button */}
        <Navbar />
      </div>
    </header>
  );
}
