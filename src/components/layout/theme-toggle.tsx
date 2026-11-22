"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleTheme } from "@/store/slices/ui";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => dispatch(toggleTheme())}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
