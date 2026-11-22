"use client";

import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import {
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
} from "@/config/constants";
import type { Department } from "@/types/department";
import type { EmployeeStatus, EmploymentType } from "@/types/employee";

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  status: EmployeeStatus | "";
  onStatusChange: (value: EmployeeStatus | "") => void;
  employmentType: EmploymentType | "";
  onEmploymentTypeChange: (value: EmploymentType | "") => void;
  departments: Department[];
}

export function EmployeeFilters({
  search,
  onSearchChange,
  departmentId,
  onDepartmentChange,
  status,
  onStatusChange,
  employmentType,
  onEmploymentTypeChange,
  departments,
}: EmployeeFiltersProps) {
  return (
    <div className="grid gap-3 border-b p-4 md:grid-cols-2 xl:grid-cols-4">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search employees…"
        className="w-full"
      />
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
        onValueChange={(value) => onStatusChange(value as EmployeeStatus | "")}
        options={EMPLOYEE_STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        placeholder="Filter by status"
        emptyLabel="All statuses"
        className="w-full"
      />
      <FilterDropdown
        value={employmentType}
        onValueChange={(value) => onEmploymentTypeChange(value as EmploymentType | "")}
        options={EMPLOYMENT_TYPE_OPTIONS}
        placeholder="Filter by employment type"
        emptyLabel="All types"
        className="w-full"
      />
    </div>
  );
}
