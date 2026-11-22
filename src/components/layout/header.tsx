"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { findNavItem } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "./global-search";
import { NotificationsMenu } from "./notifications-menu";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "./theme-toggle";
import { useAppDispatch } from "@/store";
import { setMobileSidebarOpen } from "@/store/slices/ui";

export function Header() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const current = findNavItem(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => dispatch(setMobileSidebarOpen(true))}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <div className="hidden min-w-0 md:block">
        <p className="truncate text-sm font-semibold">{current?.label ?? "Overview"}</p>
        <p className="truncate text-xs text-muted-foreground">PeopleHub workspace</p>
      </div>

      <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <div className="hidden max-w-sm flex-1 sm:block">
          <GlobalSearch />
        </div>
        <ThemeToggle />
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}
