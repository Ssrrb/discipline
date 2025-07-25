export type NavigationItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export const navigationConfig = {
  main: (storeId: string | null | undefined, storeName: string | null | undefined) => [{
    label: storeName || (storeId ? "Dashboard" : "Home"),
    href: storeId ? `/${storeId}` : "/",
  }, {
    label: "Settings",
    href: storeId ? `/${storeId}/settings` : "/settings",
  }, {
    label: "Categories",
    href: storeId ? `/${storeId}/categories` : "/categories",
  },
  {
    label: "Products",
    href: storeId ? `/${storeId}/products` : "/products",
  },
  {
    label: "Sales",
    href: storeId ? `/${storeId}/sales` : "/sales",
  }
    
],

  mobile: (storeId: string | null | undefined, storeName: string | null | undefined) => [{
    label: storeName || (storeId ? "Dashboard" : "Home"),
    href: storeId ? `/${storeId}` : "/",
  }, {
    label: "Settings",
    href: storeId ? `/${storeId}/settings` : "/settings",
  },
  {
    label: "Categories",
    href: storeId ? `/${storeId}/categories` : "/categories",
  },
  {
    label: "Products",
    href: storeId ? `/${storeId}/products` : "/products",
  },
  {
    label: "Sales",
    href: storeId ? `/${storeId}/sales` : "/sales",
  }
],

};

export const DEFAULT_APP_ICON = "Apple" as const;
