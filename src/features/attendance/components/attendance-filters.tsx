"use client";

import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ATTENDANCE_STATUS_OPTIONS } from "@/config/constants";
import type { Department } from "@/types/department";
import type { AttendanceStatus } from "@/types/attendance";

interface AttendanceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  status: AttendanceStatus | "";
  onStatusChange: (value: AttendanceStatus | "") => void;
  from: string;
  onFromChange: (value: string) => void;
  to: string;
  onToChange: (value: string) => void;
  departments: Department[];
}

export function AttendanceFilters({
  search,
  onSearchChange,
  departmentId,
  onDepartmentChange,
  status,
  onStatusChange,
  from,
  onFromChange,
  to,
  onToChange,
  departments,
}: AttendanceFiltersProps) {
  return (
    <div className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-5">
      <SearchInput value={search} onChange={onSearchChange} placeholder="Search employees…" className="w-full" />
      <FilterDropdown
        value={departmentId}
        onValueChange={onDepartmentChange}
        options={departments.map((department) => ({ value: department.id, label: department.name }))}
        placeholder="Filter by department"
        emptyLabel="All departments"
        className="w-full"
      />
      <FilterDropdown
        value={status}
        onValueChange={(value) => onStatusChange(value as AttendanceStatus | "")}
        options={ATTENDANCE_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        placeholder="Filter by status"
        emptyLabel="All statuses"
        className="w-full"
      />
      <div className="space-y-1">
        <Label htmlFor="attendanceFrom">From</Label>
        <Input id="attendanceFrom" type="date" value={from} onChange={(event) => onFromChange(event.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="attendanceTo">To</Label>
        <Input id="attendanceTo" type="date" value={to} onChange={(event) => onToChange(event.target.value)} />
      </div>
    </div>
  );
}
