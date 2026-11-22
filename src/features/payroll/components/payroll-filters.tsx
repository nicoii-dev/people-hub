"use client";

import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import type { PayrollPeriod } from "@/types/payroll";

interface PayrollFiltersProps {
  periods: PayrollPeriod[];
  periodId: string;
  onPeriodChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export function PayrollFilters({
  periods,
  periodId,
  onPeriodChange,
  search,
  onSearchChange,
}: PayrollFiltersProps) {
  return (
    <div className="grid gap-3 border-b p-4 md:grid-cols-2">
      <FilterDropdown
        value={periodId}
        onValueChange={onPeriodChange}
        options={periods.map((period) => ({ value: period.id, label: period.label }))}
        placeholder="Filter by period"
        emptyLabel="All periods"
        className="w-full"
      />
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search employees..."
        className="w-full"
      />
    </div>
  );
}
