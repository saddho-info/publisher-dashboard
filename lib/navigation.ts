export type NavIconName =
  | "dashboard"
  | "books"
  | "inventory"
  | "libraries"
  | "distribution"
  | "sales"
  | "analytics"
  | "alerts"
  | "reports"
  | "publishers"
  | "users"
  | "settings";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  phase: string;
  icon: NavIconName;
  /** When set, only these roles see the item in the sidebar. */
  roles?: string[];
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        description:
          "Inventory, distribution, and sales at a glance — the seven publisher questions.",
        phase: "Phase 5",
        icon: "dashboard",
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        href: "/books",
        label: "Books",
        description: "Catalog titles and editions for this publisher.",
        phase: "Phase 6",
        icon: "books",
      },
      {
        href: "/inventory",
        label: "Inventory",
        description: "Copy-level stock, QR tokens, and warehouse aggregates.",
        phase: "Phase 7",
        icon: "inventory",
      },
      {
        href: "/libraries",
        label: "Libraries",
        description: "Libraries this publisher distributes to.",
        phase: "Phase 8",
        icon: "libraries",
      },
      {
        href: "/distribution",
        label: "Distribution",
        description: "Allocate and dispatch copies to libraries.",
        phase: "Phase 9",
        icon: "distribution",
      },
      {
        href: "/sales",
        label: "Sales",
        description: "Publisher-facing sale history across partner libraries.",
        phase: "Phase 10",
        icon: "sales",
      },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      {
        href: "/analytics",
        label: "Analytics",
        description: "Top books, library performance, and trend charts.",
        phase: "Phase 11",
        icon: "analytics",
      },
      {
        href: "/alerts",
        label: "Alerts",
        description: "Low-stock and operational exceptions that need attention.",
        phase: "Phase 11",
        icon: "alerts",
      },
      {
        href: "/reports",
        label: "Reports",
        description: "Exportable inventory, sales, and audit reports.",
        phase: "Phase 20",
        icon: "reports",
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      {
        href: "/publishers",
        label: "Publishers",
        description: "Create and manage publisher organizations.",
        phase: "Phase 8",
        icon: "publishers",
        roles: ["SUPER_ADMIN"],
      },
      {
        href: "/users",
        label: "Users",
        description: "Publisher staff accounts and role assignment.",
        phase: "Phase 8",
        icon: "users",
      },
      {
        href: "/settings",
        label: "Settings",
        description: "Organization profile and dashboard preferences.",
        phase: "Later",
        icon: "settings",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export function getNavItem(href: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.href === href);
}

export function matchNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function navVisibleForRole(item: NavItem, role: string): boolean {
  if (!item.roles || item.roles.length === 0) {
    return true;
  }
  return item.roles.includes(role);
}

export function filterNavGroupsForRole(role: string): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => navVisibleForRole(item, role)),
  })).filter((group) => group.items.length > 0);
}
