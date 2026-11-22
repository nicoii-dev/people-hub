"use client";

import { Archive, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EMPLOYEE_STATUS_OPTIONS } from "@/config/constants";
import type { Employee, EmployeeStatus } from "@/types/employee";

interface EmployeeStatusMenuProps {
  employee: Employee;
  canEdit: boolean;
  canArchive: boolean;
  onEdit: (employee: Employee) => void;
  onChangeStatus: (employee: Employee, status: EmployeeStatus) => void;
  onArchive: (employee: Employee) => void;
}

export function EmployeeStatusMenu({
  employee,
  canEdit,
  canArchive,
  onEdit,
  onChangeStatus,
  onArchive,
}: EmployeeStatusMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={!canEdit && !canArchive} aria-label={`Actions for ${employee.firstName} ${employee.lastName}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Manage employee</DropdownMenuLabel>
        <DropdownMenuItem disabled={!canEdit} onSelect={() => onEdit(employee)}>
          <Pencil />
          Edit details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Update status</DropdownMenuLabel>
        {EMPLOYEE_STATUS_OPTIONS.filter((option) => option.value !== "archived").map((option) => (
          <DropdownMenuItem
            key={option.value}
            disabled={!canEdit || employee.employmentStatus === option.value}
            onSelect={() => onChangeStatus(employee, option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canArchive || employee.employmentStatus === "archived"}
          onSelect={() => onArchive(employee)}
          className="text-destructive focus:text-destructive"
        >
          <Archive />
          Archive employee
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
