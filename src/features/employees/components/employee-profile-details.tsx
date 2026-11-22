import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";
import type { Position } from "@/types/position";

interface EmployeeProfileDetailsProps {
  employee: Employee;
  department?: Department;
  position?: Position;
  supervisor?: Employee;
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function EmployeeProfileDetails({
  employee,
  department,
  position,
  supervisor,
}: EmployeeProfileDetailsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
          <CardDescription>Basic employee details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Detail label="Email" value={employee.email} />
          <Detail label="Contact number" value={employee.contactNumber} />
          <Detail label="Date of birth" value={formatDate(employee.dateOfBirth)} />
          <Detail label="Gender" value={employee.gender} />
          <Detail label="Civil status" value={employee.civilStatus} />
          <Detail label="Nationality" value={employee.nationality} />
          <Detail label="Address" value={employee.address} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment details</CardTitle>
          <CardDescription>Job assignment and reporting line.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Detail label="Department" value={department?.name} />
          <Detail label="Position" value={position?.title} />
          <Detail label="Supervisor" value={supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : "—"} />
          <Detail label="Employment type" value={employee.employmentType} />
          <Detail label="Date hired" value={formatDate(employee.dateHired)} />
          <Detail label="Work location" value={employee.workLocation} />
          <Detail label="Salary grade" value={employee.salaryGrade} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Government IDs</CardTitle>
          <CardDescription>Compliance identifiers.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Detail label="SSS" value={employee.governmentIds.sss} />
          <Detail label="PhilHealth" value={employee.governmentIds.philhealth} />
          <Detail label="Pag-IBIG" value={employee.governmentIds.pagibig} />
          <Detail label="TIN" value={employee.governmentIds.tin} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency contact</CardTitle>
          <CardDescription>Primary person to contact in an emergency.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Detail label="Name" value={employee.emergencyContact.name} />
          <Detail label="Relationship" value={employee.emergencyContact.relationship} />
          <Detail label="Contact number" value={employee.emergencyContact.contactNumber} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education & skills</CardTitle>
          <CardDescription>Academic background and core capabilities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {employee.education.length ? (
              employee.education.map((record) => (
                <div key={record.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{record.degree}</p>
                  <p className="text-xs text-muted-foreground">{record.school} · {record.yearGraduated}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No education records.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {employee.skills.length ? (
              employee.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)
            ) : (
              <p className="text-sm text-muted-foreground">No skills recorded.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Files attached to this employee record.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {employee.documents.length ? (
            employee.documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between rounded-lg border p-3">
                <p className="text-sm font-medium">{document.name}</p>
                <p className="text-xs text-muted-foreground">{document.type} · {document.sizeKb} KB</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No documents uploaded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
