"use client";

import * as React from "react";
import { Building2, Search, UsersRound } from "lucide-react";
import { useDepartments } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const trimmed = query.trim();

  const employeesQuery = useEmployees({ limit: 50, search: trimmed || undefined });
  const departmentsQuery = useDepartments();

  const employees = (employeesQuery.data?.data.items ?? []).slice(0, 4);
  const departments = (departmentsQuery.data?.data.items ?? [])
    .filter((department) =>
      trimmed
        ? `${department.name} ${department.code}`.toLowerCase().includes(trimmed.toLowerCase())
        : false,
    )
    .slice(0, 3);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            placeholder="Search employees, departments…"
            aria-label="Global search"
            className="pl-9"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(28rem,calc(100vw-2rem))] p-2">
        {!trimmed ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Type at least one character to search mock records.
          </p>
        ) : (
          <div className="scrollbar-thin max-h-80 space-y-3 overflow-y-auto">
            {employees.length ? (
              <div>
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Employees</p>
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
                    <EmployeeAvatar
                      firstName={employee.firstName}
                      lastName={employee.lastName}
                      color={employee.avatarColor}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{employee.email}</p>
                    </div>
                    <UsersRound className="size-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : null}

            {departments.length ? (
              <div>
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground">Departments</p>
                {departments.map((department) => (
                  <div key={department.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
                    <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                      <Building2 className="size-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{department.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{department.code} · {department.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!employees.length && !departments.length ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No mock records match “{trimmed}”.
              </p>
            ) : null}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
