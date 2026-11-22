import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Network,
  Settings,
  Target,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "./permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  available: boolean;
  badge?: string;
  children?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    permission: "dashboard:view",
    available: true,
  },
  {
    label: "Employee Management",
    href: "/employees",
    icon: UsersRound,
    permission: "employees:view",
    available: false,
    children: [
      {
        label: "Employee Directory",
        href: "/employees",
        icon: UsersRound,
        permission: "employees:view",
        available: false,
      },
      {
        label: "Departments",
        href: "/departments",
        icon: Network,
        permission: "departments:view",
        available: false,
      },
      {
        label: "Positions",
        href: "/positions",
        icon: BriefcaseBusiness,
        permission: "departments:view",
        available: false,
      },
    ],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: CalendarCheck2,
    permission: "attendance:view",
    available: false,
  },
  {
    label: "Leave Management",
    href: "/leave",
    icon: CalendarDays,
    permission: "leave:view",
    available: false,
    badge: "Soon",
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: WalletCards,
    permission: "payroll:view",
    available: false,
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: ClipboardList,
    permission: "recruitment:view",
    available: false,
  },
  {
    label: "Performance",
    href: "/performance",
    icon: Target,
    permission: "performance:view",
    available: false,
  },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    permission: "reports:view",
    available: false,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "settings:view",
    available: false,
    children: [
      {
        label: "Company Profile",
        href: "/settings/company",
        icon: Settings,
        permission: "settings:view",
        available: false,
      },
      {
        label: "Users & Roles",
        href: "/settings/users",
        icon: UsersRound,
        permission: "settings:manage",
        available: false,
      },
    ],
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  for (const item of navigation) {
    if (item.href === pathname) return item;
    const child = item.children?.find((entry) => entry.href === pathname);
    if (child) return child;
  }
  return undefined;
}
