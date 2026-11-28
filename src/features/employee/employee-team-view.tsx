"use client";

import * as React from "react";
import { Mail, MapPin, Search, UsersRound } from "lucide-react";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeTimeClock } from "@/features/attendance/components/employee-time-clock";
import { useAuth } from "@/features/auth/hooks";
import { useDepartments, usePositions } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import type { EmployeeStatus } from "@/types/employee";

const statusLabels: Record<EmployeeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On leave",
  archived: "Archived",
};

const statusVariants: Record<
  EmployeeStatus,
  "success" | "secondary" | "warning" | "outline"
> = {
  active: "success",
  inactive: "secondary",
  on_leave: "warning",
  archived: "outline",
};

export function EmployeeTeamView() {
  const { user } = useAuth();
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("all");
  const employees = useEmployees({ limit: 100, sort: "firstName" });
  const departments = useDepartments();
  const positions = usePositions();

  const departmentMap = React.useMemo(
    () => new Map((departments.data?.data.items ?? []).map((item) => [item.id, item.name])),
    [departments.data],
  );
  const positionMap = React.useMemo(
    () => new Map((positions.data?.data.items ?? []).map((item) => [item.id, item.title])),
    [positions.data],
  );

  const colleagues = React.useMemo(() => {
    let items = employees.data?.data.items ?? [];
    items = items.filter((employee) => employee.id !== user?.employeeId);

    if (departmentId !== "all") {
      items = items.filter((employee) => employee.departmentId === departmentId);
    }

    const term = search.trim().toLowerCase();
    if (term) {
      items = items.filter((employee) =>
        [
          `${employee.firstName} ${employee.lastName}`,
          employee.email,
          positionMap.get(employee.positionId) ?? "",
          departmentMap.get(employee.departmentId) ?? "",
          employee.workLocation,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    }

    return items;
  }, [departmentMap, departmentId, employees.data, positionMap, search, user?.employeeId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Directory"
        description="Browse your colleagues and record your time for the day."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="size-5 text-primary" />
              PeopleHub team
            </CardTitle>
            <CardDescription>
              {colleagues.length} teammate{colleagues.length === 1 ? "" : "s"} found
            </CardDescription>
            <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, role, team, or email"
                  className="pl-9"
                  aria-label="Search colleagues"
                />
              </div>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="sm:w-52" aria-label="Filter by department">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {(departments.data?.data.items ?? []).map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {employees.isPending ? (
              <LoadingSkeleton variant="cards" count={6} />
            ) : employees.isError ? (
              <p className="text-sm text-destructive">The team directory could not be loaded.</p>
            ) : colleagues.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {colleagues.map((employee) => (
                  <div key={employee.id} className="rounded-lg border bg-muted/20 p-4">
                    <div className="flex items-start gap-3">
                      <EmployeeAvatar
                        firstName={employee.firstName}
                        lastName={employee.lastName}
                        color={employee.avatarColor}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <Badge variant={statusVariants[employee.employmentStatus]}>
                            {statusLabels[employee.employmentStatus]}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {positionMap.get(employee.positionId) ?? employee.positionId} ·{" "}
                          {departmentMap.get(employee.departmentId) ?? employee.departmentId}
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          {employee.workLocation}
                        </p>
                        <a
                          href={`mailto:${employee.email}`}
                          className="mt-1 flex items-center gap-1.5 truncate text-xs text-primary hover:underline"
                        >
                          <Mail className="size-3.5 shrink-0" />
                          {employee.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <UsersRound className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No colleagues match your filters</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a different name or department.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <EmployeeTimeClock />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Directory tips</CardTitle>
              <CardDescription>Use the directory to connect with the right teammate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Search by name to find a teammate quickly.</p>
              <p>Filter by department to see a specific team.</p>
              <p>Select an email address to send a message directly.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
