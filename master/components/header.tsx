import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import Navbar from "@/components/navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur border-b shadow-sm">
      <div className="h-20 max-w-7xl mx-auto flex items-center px-4 md:px-8">
        {/* Desktop Navigation */}
        <div className="flex-1 flex items-center">
          <MainNav />
        </div>
        {/* Mobile Navigation */}
        <div className="flex md:hidden flex-1">
          <MobileNav />
        </div>
        {/* User Button */}
        <Navbar />
      </div>
    </header>
  );
}
