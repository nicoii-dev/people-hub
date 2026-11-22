"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { usePermission } from "@/features/auth/hooks";
import { useDepartments, usePositions } from "@/hooks/use-departments";
import { useEmployee, useEmployees } from "@/hooks/use-employees";
import { EmployeeFormDialog } from "./components/employee-form-dialog";
import { EmployeeProfileDetails } from "./components/employee-profile-details";
import { EmployeeProfileHeader } from "./components/employee-profile-header";

interface EmployeeDetailViewProps {
  employeeId: string;
}

export function EmployeeDetailView({ employeeId }: EmployeeDetailViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const canEdit = usePermission("employees:edit");
  const employeeQuery = useEmployee(employeeId);
  const departmentsQuery = useDepartments();
  const positionsQuery = usePositions();
  const employeesQuery = useEmployees({ limit: 100 });

  if (employeeQuery.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Employee profile" description="Loading employee record…" />
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (employeeQuery.isError || !employeeQuery.data) {
    const message = employeeQuery.error instanceof Error ? employeeQuery.error.message : "";
    if (message.toLowerCase().includes("not found")) {
      return (
        <EmptyState
          title="Employee not found"
          description="This employee record does not exist or was removed."
          action={
            <Button asChild variant="outline">
              <Link href="/employees">
                <ArrowLeft />
                Back to directory
              </Link>
            </Button>
          }
        />
      );
    }

    return (
      <ErrorState
        title="Employee unavailable"
        description="The employee record could not be loaded."
        error={employeeQuery.error}
        onRetry={() => void employeeQuery.refetch()}
      />
    );
  }

  const employee = employeeQuery.data.data;
  const departments = departmentsQuery.data?.data.items ?? [];
  const positions = positionsQuery.data?.data.items ?? [];
  const employees = employeesQuery.data?.data.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee profile"
        description={`Record details for ${employee.firstName} ${employee.lastName}.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/employees">
                <ArrowLeft />
                Back
              </Link>
            </Button>
            {canEdit ? (
              <Button onClick={() => setEditOpen(true)}>
                <Pencil />
                Edit employee
              </Button>
            ) : null}
          </>
        }
      />

      <EmployeeProfileHeader
        employee={employee}
        department={departments.find((department) => department.id === employee.departmentId)}
        position={positions.find((position) => position.id === employee.positionId)}
      />

      <EmployeeProfileDetails
        employee={employee}
        department={departments.find((department) => department.id === employee.departmentId)}
        position={positions.find((position) => position.id === employee.positionId)}
        supervisor={employees.find((item) => item.id === employee.supervisorId)}
      />

      <EmployeeFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        employee={employee}
        departments={departments}
        positions={positions}
        employees={employees}
      />
    </div>
  );
}
