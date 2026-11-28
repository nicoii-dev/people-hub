"use client";

import { BadgeCheck, IdCard, UserCircle } from "lucide-react";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeProfileDetails } from "@/features/employees/components/employee-profile-details";
import { useAuth } from "@/features/auth/hooks";
import { useDepartments, usePositions } from "@/hooks/use-departments";
import { useEmployee } from "@/hooks/use-employees";
import { formatDate } from "@/lib/utils";

export function EmployeeProfileView() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "";
  const employee = useEmployee(employeeId);
  const departments = useDepartments();
  const positions = usePositions();
  const supervisor = useEmployee(employee.data?.data.supervisorId ?? "");

  if (employee.isPending) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (employee.isError || !employee.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Your profile could not be loaded. Please try again.
        </CardContent>
      </Card>
    );
  }

  const record = employee.data.data;
  const department = departments.data?.data.items.find((item) => item.id === record.departmentId);
  const position = positions.data?.data.items.find((item) => item.id === record.positionId);
  const supervisorRecord = supervisor.data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My profile"
        description="Your current employee record and company identification details."
      />

      <Card className="border-primary/20">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <EmployeeAvatar
              firstName={record.firstName}
              lastName={record.lastName}
              color={record.avatarColor}
              size="lg"
            />
            <div>
              <h2 className="text-xl font-semibold">
                {record.firstName} {record.middleName ? `${record.middleName} ` : ""}
                {record.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {position?.title ?? record.positionId} · {department?.name ?? record.departmentId}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{record.employmentType}</Badge>
                <Badge
                  variant={record.employmentStatus === "active" ? "success" : "warning"}
                >
                  {record.employmentStatus.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-primary/5 p-4 sm:min-w-64">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <IdCard className="size-3.5" /> Company ID
            </p>
            <p className="mt-1 font-mono text-lg font-semibold tracking-tight">
              {record.employeeNumber}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Employee since {formatDate(record.dateHired)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCircle className="size-4 text-primary" />
            Account details
          </CardTitle>
          <CardDescription>How your account appears across PeopleHub.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Account email</p>
            <p className="mt-1 text-sm font-medium">{user?.email ?? record.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Job title</p>
            <p className="mt-1 text-sm font-medium">{user?.title ?? position?.title ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Work location</p>
            <p className="mt-1 text-sm font-medium">{record.workLocation}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
        <BadgeCheck className="size-5 shrink-0" />
        Your employee record is up to date. Contact Human Resources if any detail needs correction.
      </div>

      <EmployeeProfileDetails
        employee={record}
        department={department}
        position={position}
        supervisor={supervisorRecord}
      />
    </div>
  );
}
