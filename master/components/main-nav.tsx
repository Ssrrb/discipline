"use client";

import Link from "next/link";
import { Apple } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import {
  navigationConfig,
  DEFAULT_APP_ICON,
} from "@/components/navigation/navigation-config";

interface MainNavProps {
  store: {
    id: string;
    name: string;
    userId: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  } | null;
}

export function MainNav({ store }: MainNavProps) {
  const items = navigationConfig.main(store?.id, store?.name);

  return (
    <div className="flex items-center w-full justify-center lg:justify-start lg:items-start">
      {/* Logo always centered up to md, then flush left on lg+ */}
      <Link
        href="/"
        className="flex items-center gap-2 mx-auto lg:mx-0 lg:mr-6"
      >
        <Apple className="text-red-500" size={24} />
        <span className="font-bold text-lg">Discipline</span>
      </Link>

      {/* On small screens this will still render, but you’ll probably hide it behind your mobile-sheet */}
      <NavigationMenu>
        <NavigationMenuList className="flex items-center gap-3 lg:gap-4">
          {items.map((item) => (
            <NavigationMenuItem key={item.href}>
              <Link href={item.href} className={navigationMenuTriggerStyle()}>
                {item.label}
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
