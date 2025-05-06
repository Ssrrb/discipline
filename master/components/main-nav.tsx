"use client";

import Link from "next/link";
import { Apple } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

export function MainNav() {
  return (
    <div className="hidden md:flex items-center">
      <Link href="/">
        <Apple className="text-red-500" />
      </Link>

      <NavigationMenu className="ml-8">
        <NavigationMenuList className="flex items-center gap-3 lg:gap-4">
          {/* TODO: Retrieve the store name from the neon db using drizzle */}
          <NavigationMenuItem>
            <Link href="/project" className={navigationMenuTriggerStyle()}>
              StoreName!
            </Link>
          </NavigationMenuItem>

          {/* TODO: Settings link */}
          <NavigationMenuItem>
            <Link href="/about" className={navigationMenuTriggerStyle()}>
              Settings
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
