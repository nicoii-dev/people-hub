"use client";

import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS } from "@/config/constants";
import type { LeaveStatus, LeaveType } from "@/types/leave";

interface LeaveFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: LeaveStatus | "";
  onStatusChange: (value: LeaveStatus | "") => void;
  type: LeaveType | "";
  onTypeChange: (value: LeaveType | "") => void;
  from: string;
  onFromChange: (value: string) => void;
  to: string;
  onToChange: (value: string) => void;
}

export function LeaveFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  type,
  onTypeChange,
  from,
  onFromChange,
  to,
  onToChange,
}: LeaveFiltersProps) {
  return (
    <div className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-5">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search employees…" className="w-full" />
      <FilterDropdown
        value={status}
        onValueChange={(value) => onStatusChange(value as LeaveStatus | "")}
        options={LEAVE_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        placeholder="Filter by status"
        emptyLabel="All statuses"
        className="w-full"
      />
      <FilterDropdown
        value={type}
        onValueChange={(value) => onTypeChange(value as LeaveType | "")}
        options={LEAVE_TYPE_OPTIONS}
        placeholder="Filter by type"
        emptyLabel="All leave types"
        className="w-full"
      />
      <div className="space-y-1">
        <Label htmlFor="leaveFrom">From</Label>
        <Input id="leaveFrom" type="date" value={from} onChange={(event) => onFromChange(event.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="leaveTo">To</Label>
        <Input id="leaveTo" type="date" value={to} onChange={(event) => onToChange(event.target.value)} />
      </div>
    </div>
  );
}
