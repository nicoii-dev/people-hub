"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight, Lock, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  employeeNavigation,
  navigation,
  superAdminNavigation,
  type NavItem,
} from "@/config/navigation";
import { ROLE_LABELS, hasPermission } from "@/config/permissions";
import { useAuth } from "@/features/auth/hooks";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleSidebar } from "@/store/slices/ui";

interface SidebarProps {
  inSheet?: boolean;
  onNavigate?: () => void;
}

function NavRow({
  item,
  collapsed,
  active,
  disabled,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  disabled: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const content = (
    <div
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        disabled && "cursor-not-allowed opacity-60 hover:bg-transparent hover:text-muted-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {disabled ? (
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Soon</Badge>
          ) : null}
        </>
      ) : null}
    </div>
  );

  if (disabled) {
    return <div aria-disabled="true" title="Available in a later phase">{content}</div>;
  }

  const link = (
    <Link href={item.href} onClick={onClick} aria-current={active ? "page" : undefined} className="block">
      {content}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar({ inSheet = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const collapsedFromStore = useAppSelector((state) => state.ui.sidebarCollapsed);
  const collapsed = inSheet ? false : collapsedFromStore;
  const { user, hydrated } = useAuth();
  const [openGroups, setOpenGroups] = React.useState<string[]>(["/employees"]);

  // Never render role-based links until the persisted session is restored.
  // Employees and super admins get dedicated navigation instead of the HR menu.
  const visibleNavigation =
    user?.role === "employee"
      ? employeeNavigation
      : user?.role === "super_admin"
        ? superAdminNavigation
        : navigation;
  const allowed = (item: NavItem) => {
    if (!hydrated || !user) return false;
    return hasPermission(user.role, item.permission);
  };

  function toggleGroup(href: string) {
    setOpenGroups((current) =>
      current.includes(href) ? current.filter((entry) => entry !== href) : [...current, href],
    );
  }

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-background transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center gap-3 px-4", collapsed && "justify-center px-0")}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <UsersRound className="size-5" />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">PeopleHub</p>
            <p className="truncate text-xs text-muted-foreground">HR Operations</p>
          </div>
        ) : null}
      </div>

      <Separator />

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
        {visibleNavigation
          .filter(allowed)
          .map((item) => {
            const children = (item.children ?? []).filter(allowed);
            const active = Boolean(
              pathname === item.href || children.some((child) => child.href === pathname),
            );
            const isOpen = openGroups.includes(item.href);

            if (children.length) {
              return (
                <div key={item.href} className="space-y-1">
                  {collapsed ? (
                    <NavRow item={item} collapsed active={Boolean(active)} disabled={!item.available} onClick={onNavigate} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.href)}
                      className={cn(
                        "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                      aria-expanded={isOpen}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                  )}
                  {!collapsed && isOpen ? (
                    <div className="ml-4 space-y-1 border-l pl-3">
                      {children.map((child) => (
                        <NavRow
                          key={child.href}
                          item={child}
                          collapsed={false}
                          active={pathname === child.href}
                          disabled={!child.available}
                          onClick={onNavigate}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <NavRow
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={active}
                disabled={!item.available}
                onClick={onNavigate}
              />
            );
          })}
      </nav>

      <div className="border-t p-3">
        {!collapsed ? (
          <div className="mb-3 rounded-lg bg-muted p-3">
            <p className="text-xs font-medium text-muted-foreground">Viewing as</p>
            <p className="mt-0.5 truncate text-sm font-semibold">
              {user ? ROLE_LABELS[user.role] : "No session"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Mock role — switch from the profile menu.</p>
          </div>
        ) : null}
        {!inSheet ? (
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={() => dispatch(toggleSidebar())}
            className={cn("w-full", collapsed && "px-0")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            {!collapsed ? <span>Collapse sidebar</span> : null}
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" />
            Role-based navigation active
          </div>
        )}
      </div>
    </aside>
  );
}
