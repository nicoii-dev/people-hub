"use client";

import * as React from "react";
import { BriefcaseBusiness, Building2, Plus, SearchX, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDepartments, useDeleteDepartment, usePositions } from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";
import type { Position } from "@/types/position";
import { DepartmentFormDialog } from "./components/department-form-dialog";
import { DepartmentTable } from "./components/department-table";

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

const EMPTY_DEPARTMENTS: Department[] = [];
const EMPTY_EMPLOYEES: Employee[] = [];
const EMPTY_POSITIONS: Position[] = [];

export function DepartmentsView() {
  const [search, setSearch] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedDepartment, setSelectedDepartment] = React.useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Department | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);
  const canManage = usePermission("departments:manage");
  const departmentsQuery = useDepartments();
  const positionsQuery = usePositions();
  const employeesQuery = useEmployees({ limit: 100 });
  const deleteMutation = useDeleteDepartment();

  const allDepartments = departmentsQuery.data?.data.items ?? EMPTY_DEPARTMENTS;
  const employees = employeesQuery.data?.data.items ?? EMPTY_EMPLOYEES;
  const positions = positionsQuery.data?.data.items ?? EMPTY_POSITIONS;

  const departments = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return allDepartments;
    return allDepartments.filter((department) =>
      `${department.name} ${department.code} ${department.location}`.toLowerCase().includes(query),
    );
  }, [allDepartments, debouncedSearch]);

  const employeeCounts = React.useMemo(() => {
    return employees.reduce<Record<string, number>>((counts, employee) => {
      counts[employee.departmentId] = (counts[employee.departmentId] ?? 0) + 1;
      return counts;
    }, {});
  }, [employees]);

  const positionCounts = React.useMemo(() => {
    return positions.reduce<Record<string, number>>((counts, position) => {
      counts[position.departmentId] = (counts[position.departmentId] ?? 0) + 1;
      return counts;
    }, {});
  }, [positions]);

  function openCreate() {
    setSelectedDepartment(null);
    setFormOpen(true);
  }

  function openEdit(department: Department) {
    setSelectedDepartment(department);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Department deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organize teams, reporting lines, and department ownership."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus />
              Add department
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Departments"
          value={allDepartments.length}
          icon={Building2}
          description="Active organizational units"
          loading={departmentsQuery.isPending}
        />
        <StatCard
          title="Employees"
          value={employees.length}
          icon={UsersRound}
          description="Across all departments"
          loading={employeesQuery.isPending}
        />
        <StatCard
          title="Positions"
          value={positions.length}
          icon={BriefcaseBusiness}
          description="Defined job roles"
          loading={positionsQuery.isPending}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search departments…"
            className="w-full sm:max-w-sm"
          />
        </div>

        {departmentsQuery.isError ? (
          <div className="p-4">
            <ErrorState
              title="Departments unavailable"
              description="The department list could not be loaded."
              error={departmentsQuery.error}
              onRetry={() => void departmentsQuery.refetch()}
            />
          </div>
        ) : departmentsQuery.isPending ? (
          <div className="p-4">
            <LoadingSkeleton variant="table" count={8} />
          </div>
        ) : departments.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<SearchX className="size-5" />}
              title={search ? "No matching departments" : "No departments yet"}
              description={
                search
                  ? "Try a different search term."
                  : "Create a department to organize the organization."
              }
              action={
                !search && canManage ? (
                  <Button onClick={openCreate}>
                    <Plus />
                    Add department
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <DepartmentTable
            departments={departments}
            employees={employees}
            employeeCounts={employeeCounts}
            positionCounts={positionCounts}
            canManage={canManage}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </Card>

      <DepartmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        department={selectedDepartment}
        departments={allDepartments}
        employees={employees}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete department?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be permanently removed. Departments with assigned employees or positions cannot be deleted.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
