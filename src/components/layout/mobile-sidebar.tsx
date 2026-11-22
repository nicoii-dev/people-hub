"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store";
import { setMobileSidebarOpen } from "@/store/slices/ui";
import { Sidebar } from "./sidebar";

export function MobileSidebar() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.mobileSidebarOpen);

  return (
    <Sheet open={open} onOpenChange={(next) => dispatch(setMobileSidebarOpen(next))}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <Sidebar inSheet onNavigate={() => dispatch(setMobileSidebarOpen(false))} />
      </SheetContent>
    </Sheet>
  );
}
