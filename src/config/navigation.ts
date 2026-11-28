import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Clock,
  CreditCard,
  LayoutDashboard,
  Network,
  Package,
  Settings,
  SquareKanban,
  Target,
  Timer,
  UserCircle,
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
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard:view",
    available: true,
  },
  {
    label: "Trial setup",
    href: "/onboarding",
    icon: ClipboardList,
    permission: "settings:view",
    available: true,
  },
  {
    label: "Employee Management",
    href: "/employees",
    icon: UsersRound,
    permission: "employees:view",
    available: true,
    children: [
      {
        label: "Employee Directory",
        href: "/employees",
        icon: UsersRound,
        permission: "employees:view",
        available: true,
      },
      {
        label: "Departments",
        href: "/departments",
        icon: Network,
        permission: "departments:view",
        available: true,
      },
      {
        label: "Positions",
        href: "/positions",
        icon: BriefcaseBusiness,
        permission: "departments:view",
        available: true,
      },
    ],
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: CalendarCheck2,
    permission: "attendance:view",
    available: true,
  },
  {
    label: "Timesheet",
    href: "/timesheet",
    icon: Clock,
    permission: "timesheet:view",
    available: true,
  },
  {
    label: "Time Entries",
    href: "/time-entries",
    icon: Timer,
    permission: "time-entries:view",
    available: true,
  },
  {
    label: "Leave Management",
    href: "/leave",
    icon: CalendarDays,
    permission: "leave:view",
    available: true,
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: WalletCards,
    permission: "payroll:view",
    available: true,
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Building2,
    permission: "clients:view",
    available: true,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: SquareKanban,
    permission: "projects:view",
    available: true,
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: ClipboardList,
    permission: "recruitment:view",
    available: true,
  },
  {
    label: "Performance",
    href: "/performance",
    icon: Target,
    permission: "performance:view",
    available: true,
  },
  {
    label: "Reports & Analytics",
    href: "/reports",
    icon: BarChart3,
    permission: "reports:view",
    available: true,
  },
  {
    label: "Platform Administration",
    href: "/platform",
    icon: Activity,
    permission: "platform:view",
    available: true,
    children: [
      {
        label: "Overview",
        href: "/platform",
        icon: LayoutDashboard,
        permission: "platform:view",
        available: true,
      },
      {
        label: "Manage companies",
        href: "/platform/companies",
        icon: Building2,
        permission: "platform-companies:manage",
        available: true,
      },
      {
        label: "Subscription Plans",
        href: "/platform/plans",
        icon: Package,
        permission: "platform-plans:manage",
        available: true,
      },
      {
        label: "Payments & Revenue",
        href: "/platform/payments",
        icon: CreditCard,
        permission: "platform-payments:view",
        available: true,
      },
      {
        label: "System Usage",
        href: "/platform/usage",
        icon: BarChart3,
        permission: "platform-usage:view",
        available: true,
      },
      {
        label: "Platform Settings",
        href: "/platform/settings",
        icon: Settings,
        permission: "platform-settings:manage",
        available: true,
      },
    ],
  },
  {
    label: "Billing & Subscription",
    href: "/billing",
    icon: CreditCard,
    permission: "billing:view",
    available: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "settings:view",
    available: true,
    children: [
      {
        label: "Company Profile",
        href: "/settings/company",
        icon: Settings,
        permission: "settings:view",
        available: true,
      },
      {
        label: "Users & Roles",
        href: "/settings/users",
        icon: UsersRound,
        permission: "settings:manage",
        available: true,
      },
    ],
  },
];

/** Employee self-service replaces the HR-facing navigation for that role. */
export const employeeNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/employee/dashboard",
    icon: LayoutDashboard,
    permission: "employee-home:view",
    available: true,
  },
  {
    label: "My onboarding",
    href: "/employee/onboarding",
    icon: ClipboardList,
    permission: "onboarding:view",
    available: true,
  },
  {
    label: "Team Directory",
    href: "/employee/team",
    icon: UsersRound,
    permission: "team-directory:view",
    available: true,
  },
  {
    label: "About Company",
    href: "/employee/about",
    icon: Building2,
    permission: "company-info:view",
    available: true,
  },
  {
    label: "My profile",
    href: "/employee/profile",
    icon: UserCircle,
    permission: "my-profile:view",
    available: true,
  },
];

/**
 * HR pages are hidden from the super-admin primary sidebar and are instead
 * available inside a selected company's workspace.
 */
export const companyWorkspaceNavigation: NavItem[] = navigation.filter(
  (item) => item.href !== "/platform",
);

/** Super admins see the platform controls as their primary navigation. */
export const superAdminNavigation: NavItem[] = [
  {
    label: "Platform overview",
    href: "/platform",
    icon: LayoutDashboard,
    permission: "platform:view",
    available: true,
  },
  {
    label: "Manage companies",
    href: "/platform/companies",
    icon: Building2,
    permission: "platform-companies:manage",
    available: true,
  },
  {
    label: "Subscription plans",
    href: "/platform/plans",
    icon: Package,
    permission: "platform-plans:manage",
    available: true,
  },
  {
    label: "Payments & revenue",
    href: "/platform/payments",
    icon: CreditCard,
    permission: "platform-payments:view",
    available: true,
  },
  {
    label: "System usage",
    href: "/platform/usage",
    icon: BarChart3,
    permission: "platform-usage:view",
    available: true,
  },
  {
    label: "Platform settings",
    href: "/platform/settings",
    icon: Settings,
    permission: "platform-settings:manage",
    available: true,
  },
];

function matchesPath(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function findNavItem(pathname: string): NavItem | undefined {
  const candidates = [...navigation, ...employeeNavigation, ...superAdminNavigation]
    .flatMap((item) => [item, ...(item.children ?? [])])
    .filter((item) => matchesPath(item.href, pathname));

  // Prefer the most specific route so child permissions win over their group.
  return candidates.sort((a, b) => b.href.length - a.href.length)[0];
}
