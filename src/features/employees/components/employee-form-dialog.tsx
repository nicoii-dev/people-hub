"use client";

import * as React from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import {
  CIVIL_STATUS_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  NO_SELECTION,
  WORK_LOCATION_OPTIONS,
} from "@/config/constants";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { formatDate } from "@/lib/utils";
import type { Department } from "@/types/department";
import type { Employee } from "@/types/employee";
import type { Position } from "@/types/position";
import {
  employeeFormToInput,
  employeeToFormValues,
  employeeFormSchema,
  type EmployeeFormValues,
} from "../schemas";

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  departments: Department[];
  positions: Position[];
  employees: Employee[];
}

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The employee could not be saved.";
}

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
  departments,
  positions,
  employees,
}: EmployeeFormDialogProps) {
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: employeeToFormValues(employee),
  });
  const { reset, control, register, handleSubmit, formState } = form;
  const education = useFieldArray({ control, name: "education" });
  const pending = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    reset(employeeToFormValues(employee));
  }, [employee, open, reset]);

  const watchedDepartmentId = useWatch({ control, name: "departmentId" });
  const filteredPositions = watchedDepartmentId
    ? positions.filter((position) => position.departmentId === watchedDepartmentId)
    : positions;

  async function onSubmit(values: EmployeeFormValues) {
    const input = employeeFormToInput(values);
    try {
      if (employee) {
        await updateMutation.mutateAsync({ id: employee.id, input });
        toast.success("Employee updated successfully");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Employee created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  const errors = formState.errors;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={employee ? "Edit employee" : "Add employee"}
      description={employee ? "Update the employee record." : "Create a new employee record in the directory."}
      className="sm:max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="personal">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="employment">Employment</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="First name" htmlFor="firstName" error={errors.firstName?.message}>
                <Input id="firstName" {...register("firstName")} />
              </FormField>
              <FormField label="Middle name" htmlFor="middleName" error={errors.middleName?.message}>
                <Input id="middleName" {...register("middleName")} />
              </FormField>
              <FormField label="Last name" htmlFor="lastName" error={errors.lastName?.message}>
                <Input id="lastName" {...register("lastName")} />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Date of birth" htmlFor="dateOfBirth" error={errors.dateOfBirth?.message}>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              </FormField>
              <FormField label="Gender" error={errors.gender?.message}>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Civil status" error={errors.civilStatus?.message}>
                <Controller
                  control={control}
                  name="civilStatus"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CIVIL_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" htmlFor="email" error={errors.email?.message}>
                <Input id="email" type="email" {...register("email")} />
              </FormField>
              <FormField label="Contact number" htmlFor="contactNumber" error={errors.contactNumber?.message}>
                <Input id="contactNumber" {...register("contactNumber")} />
              </FormField>
            </div>
            <FormField label="Address" htmlFor="address" error={errors.address?.message}>
              <Textarea id="address" {...register("address")} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Emergency contact" htmlFor="emergencyName" error={errors.emergencyContact?.name?.message}>
                <Input id="emergencyName" {...register("emergencyContact.name")} />
              </FormField>
              <FormField label="Relationship" htmlFor="emergencyRelationship" error={errors.emergencyContact?.relationship?.message}>
                <Input id="emergencyRelationship" {...register("emergencyContact.relationship")} />
              </FormField>
              <FormField label="Emergency contact number" htmlFor="emergencyContactNumber" error={errors.emergencyContact?.contactNumber?.message}>
                <Input id="emergencyContactNumber" {...register("emergencyContact.contactNumber")} />
              </FormField>
            </div>
          </TabsContent>

          <TabsContent value="employment" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Department" error={errors.departmentId?.message}>
                <Controller
                  control={control}
                  name="departmentId"
                  render={({ field }) => (
                    <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SELECTION} disabled>Select department</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Position" error={errors.positionId?.message}>
                <Controller
                  control={control}
                  name="positionId"
                  render={({ field }) => (
                    <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SELECTION} disabled>Select position</SelectItem>
                        {filteredPositions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Supervisor" error={errors.supervisorId?.message}>
                <Controller
                  control={control}
                  name="supervisorId"
                  render={({ field }) => (
                    <Select value={field.value || NO_SELECTION} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_SELECTION}>No supervisor</SelectItem>
                        {employees
                          .filter((item) => item.id !== employee?.id)
                          .map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.firstName} {item.lastName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Employment type" error={errors.employmentType?.message}>
                <Controller
                  control={control}
                  name="employmentType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Status" error={errors.employmentStatus?.message}>
                <Controller
                  control={control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EMPLOYEE_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Work location" error={errors.workLocation?.message}>
                <Controller
                  control={control}
                  name="workLocation"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WORK_LOCATION_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Date hired" htmlFor="dateHired" error={errors.dateHired?.message}>
                <Input id="dateHired" type="date" {...register("dateHired")} />
              </FormField>
              <FormField label="Salary grade" htmlFor="salaryGrade" error={errors.salaryGrade?.message}>
                <Input id="salaryGrade" type="number" min={1} max={100} {...register("salaryGrade", { valueAsNumber: true })} />
              </FormField>
              <FormField label="Skills" htmlFor="skillsText" error={errors.skillsText?.message} hint="Separate skills with commas.">
                <Input id="skillsText" {...register("skillsText")} />
              </FormField>
            </div>
            <FormField label="Nationality" htmlFor="nationality" error={errors.nationality?.message}>
              <Input id="nationality" {...register("nationality")} />
            </FormField>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <div className="space-y-3">
              {education.fields.map((record, index) => (
                <div key={record.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_9rem_2.5rem]">
                  <FormField label="School" error={errors.education?.[index]?.school?.message}>
                    <Input {...register(`education.${index}.school`)} />
                  </FormField>
                  <FormField label="Degree" error={errors.education?.[index]?.degree?.message}>
                    <Input {...register(`education.${index}.degree`)} />
                  </FormField>
                  <FormField label="Year" error={errors.education?.[index]?.yearGraduated?.message}>
                    <Input
                      type="number"
                      min={1900}
                      max={2100}
                      {...register(`education.${index}.yearGraduated`, { valueAsNumber: true })}
                    />
                  </FormField>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6 text-destructive"
                    onClick={() => education.remove(index)}
                    aria-label="Remove education record"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                education.append({
                  id: `EDU-${Date.now()}`,
                  school: "",
                  degree: "",
                  yearGraduated: 2020,
                })
              }
            >
              <Plus />
              Add education
            </Button>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="SSS number" htmlFor="sss" error={errors.governmentIds?.sss?.message}>
                <Input id="sss" {...register("governmentIds.sss")} />
              </FormField>
              <FormField label="PhilHealth number" htmlFor="philhealth" error={errors.governmentIds?.philhealth?.message}>
                <Input id="philhealth" {...register("governmentIds.philhealth")} />
              </FormField>
              <FormField label="Pag-IBIG number" htmlFor="pagibig" error={errors.governmentIds?.pagibig?.message}>
                <Input id="pagibig" {...register("governmentIds.pagibig")} />
              </FormField>
              <FormField label="TIN" htmlFor="tin" error={errors.governmentIds?.tin?.message}>
                <Input id="tin" {...register("governmentIds.tin")} />
              </FormField>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Documents</p>
              {employee?.documents.length ? (
                <div className="space-y-2">
                  {employee.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <span>{document.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {document.type} · {formatDate(document.uploadedAt.slice(0, 10))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Documents can be managed after record creation.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : employee ? "Save changes" : "Create employee"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
