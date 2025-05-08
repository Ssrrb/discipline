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
    <div className="hidden md:flex items-center">
      <Link href="/" className="flex items-center gap-2">
        <Apple className="text-red-500" />
        <span className="sr-only">Discipline</span>
      </Link>
      <NavigationMenu className="ml-8">
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
