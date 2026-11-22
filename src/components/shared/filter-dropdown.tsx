"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  className?: string;
  emptyLabel?: string;
}

export function FilterDropdown({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  emptyLabel = "All",
}: FilterDropdownProps) {
  return (
    <Select value={value || "all"} onValueChange={(next) => onValueChange(next === "all" ? "" : next)}>
      <SelectTrigger className={cn("w-full sm:w-48", className)} aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{emptyLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
