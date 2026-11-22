import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";
import type { Position } from "@/types/position";

interface EmployeeProfileHeaderProps {
  employee: Employee;
  department?: Department;
  position?: Position;
}

export function EmployeeProfileHeader({ employee, department, position }: EmployeeProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <EmployeeAvatar
          firstName={employee.firstName}
          lastName={employee.lastName}
          color={employee.avatarColor}
          size="lg"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">
              {employee.firstName} {employee.middleName ? `${employee.middleName} ` : ""}{employee.lastName}
            </h2>
            <StatusBadge status={employee.employmentStatus} />
          </div>
          <p className="text-sm text-muted-foreground">
            {employee.employeeNumber} · {position?.title ?? "No position"} · {department?.name ?? "No department"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{employee.employmentType}</Badge>
            <Badge variant="outline">{employee.workLocation}</Badge>
            <Badge variant="outline">Salary grade {employee.salaryGrade}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
