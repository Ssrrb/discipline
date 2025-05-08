"use client";

import Link from "next/link";
import { Apple } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";


type Props = {
  store: {
    id: string;
    name: string;
    userId: string;
    createdAt: Date | null;
    updatedAt: Date | null;
  } | null;
};
export function MainNav({ store }: Props) {
  return (
    <div className="hidden md:flex items-center">
      <Link href="/">
        <Apple className="text-red-500" />
      </Link>
      {/* TODO:  bring the store name from the db */}
      <NavigationMenu className="ml-8">
        <NavigationMenuList className="flex items-center gap-3 lg:gap-4">
          <NavigationMenuItem>
            <Link href="/project" className={navigationMenuTriggerStyle()}>
              {store?.name || "My Store"}
            </Link>
          </NavigationMenuItem>

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
