"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import type { Department } from "@/types/department";

interface ReportsFiltersProps {
  departments: Department[];
  departmentId: string;
  onDepartmentChange: (value: string) => void;
}

export function ReportsFilters({
  departments,
  departmentId,
  onDepartmentChange,
}: ReportsFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <FilterDropdown
        value={departmentId}
        onValueChange={onDepartmentChange}
        options={departments.map((department) => ({ value: department.id, label: department.name }))}
        placeholder="Filter by department"
        emptyLabel="All departments"
        className="w-full sm:w-64"
      />
      {departmentId ? (
        <Button variant="ghost" size="sm" onClick={() => onDepartmentChange("")}>
          <RotateCcw />
          Clear filter
        </Button>
      ) : null}
    </div>
  );
}
