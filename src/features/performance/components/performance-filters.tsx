"use client";

import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import type { Employee } from "@/types/employee";

interface PerformanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  employees?: Employee[];
  employeeId?: string;
  onEmployeeChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  statusPlaceholder?: string;
}

export function PerformanceFilters({
  search,
  onSearchChange,
  employees,
  employeeId,
  onEmployeeChange,
  status,
  onStatusChange,
  statusOptions = [],
  statusPlaceholder = "Filter by status",
}: PerformanceFiltersProps) {
  return (
    <div className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-3">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search…" className="w-full" />
      {onEmployeeChange ? (
        <FilterDropdown
          value={employeeId ?? ""}
          onValueChange={onEmployeeChange}
          options={(employees ?? []).map((employee) => ({
            value: employee.id,
            label: `${employee.firstName} ${employee.lastName}`,
          }))}
          placeholder="Filter by employee"
          emptyLabel="All employees"
          className="w-full"
        />
      ) : null}
      {onStatusChange && statusOptions.length > 0 ? (
        <FilterDropdown
          value={status ?? ""}
          onValueChange={onStatusChange}
          options={statusOptions}
          placeholder={statusPlaceholder}
          emptyLabel="All statuses"
          className="w-full"
        />
      ) : null}
    </div>
  );
}
