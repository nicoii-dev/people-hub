"use client";

import * as React from "react";
import { BriefcaseBusiness, Building2, Plus, SearchX, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { usePermission } from "@/features/auth/hooks";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useDeletePosition,
  useDepartments,
  usePositions,
} from "@/hooks/use-departments";
import { useEmployees } from "@/hooks/use-employees";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";
import type { Position } from "@/types/position";
import { PositionFormDialog } from "./components/position-form-dialog";
import { PositionTable } from "./components/position-table";

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

const EMPTY_POSITIONS: Position[] = [];
const EMPTY_DEPARTMENTS: Department[] = [];
const EMPTY_EMPLOYEES: Employee[] = [];

export function PositionsView() {
  const [search, setSearch] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedPosition, setSelectedPosition] = React.useState<Position | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Position | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);
  const canManage = usePermission("departments:manage");
  const departmentsQuery = useDepartments();
  const positionsQuery = usePositions();
  const employeesQuery = useEmployees({ limit: 100 });
  const deleteMutation = useDeletePosition();

  const allPositions = positionsQuery.data?.data.items ?? EMPTY_POSITIONS;
  const departments = departmentsQuery.data?.data.items ?? EMPTY_DEPARTMENTS;
  const employees = employeesQuery.data?.data.items ?? EMPTY_EMPLOYEES;

  const positions = React.useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return allPositions.filter((position) => {
      const matchesSearch = query
        ? `${position.title} ${position.code} ${position.level}`.toLowerCase().includes(query)
        : true;
      const matchesDepartment = departmentId ? position.departmentId === departmentId : true;
      return matchesSearch && matchesDepartment;
    });
  }, [allPositions, debouncedSearch, departmentId]);

  const employeeCounts = React.useMemo(() => {
    return employees.reduce<Record<string, number>>((counts, employee) => {
      counts[employee.positionId] = (counts[employee.positionId] ?? 0) + 1;
      return counts;
    }, {});
  }, [employees]);

  const assignedEmployees = React.useMemo(
    () => employees.filter((employee) => allPositions.some((position) => position.id === employee.positionId)).length,
    [employees, allPositions],
  );

  function openCreate() {
    setSelectedPosition(null);
    setFormOpen(true);
  }

  function openEdit(position: Position) {
    setSelectedPosition(position);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Position deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Positions"
        description="Define job roles, levels, and salary ranges."
        actions={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus />
              Add position
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Positions"
          value={allPositions.length}
          icon={BriefcaseBusiness}
          description="Defined job roles"
          loading={positionsQuery.isPending}
        />
        <StatCard
          title="Departments"
          value={departments.length}
          icon={Building2}
          description="With at least one position"
          loading={departmentsQuery.isPending}
        />
        <StatCard
          title="Assigned employees"
          value={assignedEmployees}
          icon={UsersRound}
          description="Employees in a defined position"
          loading={employeesQuery.isPending}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b p-4 sm:grid-cols-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search positions…"
            className="w-full"
          />
          <FilterDropdown
            value={departmentId}
            onValueChange={setDepartmentId}
            options={departments.map((department) => ({ value: department.id, label: department.name }))}
            placeholder="Filter by department"
            emptyLabel="All departments"
            className="w-full"
          />
        </div>

        {positionsQuery.isError ? (
          <div className="p-4">
            <ErrorState
              title="Positions unavailable"
              description="The position list could not be loaded."
              error={positionsQuery.error}
              onRetry={() => void positionsQuery.refetch()}
            />
          </div>
        ) : positionsQuery.isPending ? (
          <div className="p-4">
            <LoadingSkeleton variant="table" count={8} />
          </div>
        ) : positions.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<SearchX className="size-5" />}
              title={search || departmentId ? "No matching positions" : "No positions yet"}
              description={
                search || departmentId
                  ? "Try a different search term or department."
                  : "Create a position to define a job role."
              }
              action={
                !search && !departmentId && canManage ? (
                  <Button onClick={openCreate}>
                    <Plus />
                    Add position
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <PositionTable
            positions={positions}
            departments={departments}
            employeeCounts={employeeCounts}
            canManage={canManage}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )}
      </Card>

      <PositionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        position={selectedPosition}
        departments={departments}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete position?"
        description={
          deleteTarget
            ? `${deleteTarget.title} will be permanently removed. Positions with assigned employees cannot be deleted.`
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
