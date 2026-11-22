"use client";

import * as React from "react";
import { Plus, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDepartments, usePositions } from "@/hooks/use-departments";
import {
  useArchiveEmployee,
  useEmployees,
  useSetEmployeeStatus,
} from "@/hooks/use-employees";
import type { Employee, EmployeeQueryParams, EmployeeStatus, EmploymentType } from "@/types/employee";
import { EmployeeFilters } from "./components/employee-filters";
import { EmployeeFormDialog } from "./components/employee-form-dialog";
import { EmployeeTable } from "./components/employee-table";

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

const EMPTY_EMPLOYEES: Employee[] = [];

export function EmployeeDirectory() {
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [status, setStatus] = React.useState<EmployeeStatus | "">("");
  const [employmentType, setEmploymentType] = React.useState<EmploymentType | "">("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [archiveEmployee, setArchiveEmployee] = React.useState<Employee | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const filterKey = `${debouncedSearch}|${departmentId}|${status}|${employmentType}`;
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const handlePageChange = (nextPage: number) => setPageState({ key: filterKey, page: nextPage });

  const canCreate = usePermission("employees:create");
  const canEdit = usePermission("employees:edit");
  const canArchive = usePermission("employees:archive");

  const params: EmployeeQueryParams = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    departmentId: departmentId || undefined,
    status: status || undefined,
    employmentType: employmentType || undefined,
    sort: "lastName",
    order: "asc",
  };

  const employeesQuery = useEmployees(params);
  const supervisorOptionsQuery = useEmployees({ limit: 100 });
  const departmentsQuery = useDepartments();
  const positionsQuery = usePositions();
  const setStatusMutation = useSetEmployeeStatus();
  const archiveMutation = useArchiveEmployee();

  const departments = departmentsQuery.data?.data.items ?? [];
  const positions = positionsQuery.data?.data.items ?? [];
  const employees = employeesQuery.data?.data.items ?? [];
  const meta = employeesQuery.data?.data.meta;
  const hasFilters = Boolean(search || departmentId || status || employmentType);

  function openCreate() {
    setSelectedEmployee(null);
    setFormOpen(true);
  }

  function openEdit(employee: Employee) {
    setSelectedEmployee(employee);
    setFormOpen(true);
  }

  async function handleStatusChange(employee: Employee, nextStatus: EmployeeStatus) {
    try {
      await setStatusMutation.mutateAsync({ id: employee.id, status: nextStatus });
      toast.success(`Status updated to ${nextStatus.replaceAll("_", " ")}`);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  async function handleArchive() {
    if (!archiveEmployee) return;
    try {
      await archiveMutation.mutateAsync(archiveEmployee.id);
      toast.success("Employee archived");
      setArchiveEmployee(null);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  function clearFilters() {
    setSearch("");
    setDepartmentId("");
    setStatus("");
    setEmploymentType("");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        description="Manage employee records, employment details, and statuses."
        actions={
          canCreate ? (
            <Button onClick={openCreate}>
              <Plus />
              Add employee
            </Button>
          ) : undefined
        }
      />

      <Card className="overflow-hidden">
        <EmployeeFilters
          search={search}
          onSearchChange={setSearch}
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
          status={status}
          onStatusChange={setStatus}
          employmentType={employmentType}
          onEmploymentTypeChange={setEmploymentType}
          departments={departments}
        />

        {employeesQuery.isError ? (
          <div className="p-4">
            <ErrorState
              title="Employees unavailable"
              description="The employee directory could not be loaded."
              error={employeesQuery.error}
              onRetry={() => void employeesQuery.refetch()}
            />
          </div>
        ) : employeesQuery.isPending ? (
          <div className="p-4">
            <LoadingSkeleton variant="table" count={8} />
          </div>
        ) : employees.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<SearchX className="size-5" />}
              title={hasFilters ? "No matching employees" : "No employees yet"}
              description={
                hasFilters
                  ? "Try a different search term or clear the active filters."
                  : "Add an employee to start building the directory."
              }
              action={
                hasFilters ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : canCreate ? (
                  <Button onClick={openCreate}>
                    <Plus />
                    Add employee
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <EmployeeTable
              employees={employees}
              departments={departments}
              positions={positions}
              canEdit={canEdit}
              canArchive={canArchive}
              onEdit={openEdit}
              onChangeStatus={(employee, nextStatus) => void handleStatusChange(employee, nextStatus)}
              onArchive={setArchiveEmployee}
            />
            {meta ? <Pagination meta={meta} onPageChange={handlePageChange} /> : null}
          </>
        )}
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={selectedEmployee}
        departments={departments}
        positions={positions}
        employees={supervisorOptionsQuery.data?.data.items ?? EMPTY_EMPLOYEES}
      />

      <ConfirmDialog
        open={Boolean(archiveEmployee)}
        onOpenChange={(open) => {
          if (!open) setArchiveEmployee(null);
        }}
        title="Archive employee?"
        description={
          archiveEmployee
            ? `${archiveEmployee.firstName} ${archiveEmployee.lastName} will be marked as archived and removed from active reporting.`
            : ""
        }
        confirmLabel="Archive"
        destructive
        loading={archiveMutation.isPending}
        onConfirm={() => void handleArchive()}
      />
    </div>
  );
}
