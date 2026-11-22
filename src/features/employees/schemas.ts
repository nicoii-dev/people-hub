import { z } from "zod";
import {
  CIVIL_STATUSES,
  DOCUMENT_TYPES,
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  GENDERS,
} from "@/config/constants";
import type { Employee, EmployeeCreateInput } from "@/types/employee";

export const employeeFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  middleName: z.string().trim().max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date of birth"),
  gender: z.enum(GENDERS),
  civilStatus: z.enum(CIVIL_STATUSES),
  nationality: z.string().trim().min(1, "Nationality is required").max(60),
  contactNumber: z
    .string()
    .trim()
    .min(1, "Contact number is required")
    .regex(/^[0-9+\-\s()]+$/, "Use digits, spaces, or phone symbols only"),
  email: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(1, "Address is required").max(240),
  emergencyContact: z.object({
    name: z.string().trim().min(1, "Emergency contact name is required"),
    relationship: z.string().trim().min(1, "Relationship is required"),
    contactNumber: z.string().trim().min(1, "Emergency contact number is required"),
  }),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  departmentId: z.string().min(1, "Select a department"),
  positionId: z.string().min(1, "Select a position"),
  supervisorId: z.string(),
  dateHired: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid hire date"),
  employmentStatus: z.enum(EMPLOYEE_STATUSES),
  workLocation: z.string().trim().min(1, "Work location is required"),
  salaryGrade: z.number().int().min(1, "Salary grade must be at least 1").max(100),
  education: z.array(
    z.object({
      id: z.string(),
      school: z.string().trim().min(1, "School is required"),
      degree: z.string().trim().min(1, "Degree is required"),
      yearGraduated: z.number().int().min(1900).max(2100),
    }),
  ),
  skillsText: z.string(),
  governmentIds: z.object({
    sss: z.string().trim().min(1, "SSS number is required"),
    philhealth: z.string().trim().min(1, "PhilHealth number is required"),
    pagibig: z.string().trim().min(1, "Pag-IBIG number is required"),
    tin: z.string().trim().min(1, "TIN is required"),
  }),
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      type: z.enum(DOCUMENT_TYPES),
      uploadedAt: z.string().min(1),
      sizeKb: z.number().min(0),
    }),
  ),
  avatarColor: z.string(),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

function textOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function splitSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function employeeToFormValues(employee?: Employee | null): EmployeeFormValues {
  if (!employee) {
    return {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "1995-01-01",
      gender: "Female",
      civilStatus: "Single",
      nationality: "Filipino",
      contactNumber: "",
      email: "",
      address: "",
      emergencyContact: { name: "", relationship: "", contactNumber: "" },
      employmentType: "Full-time",
      departmentId: "",
      positionId: "",
      supervisorId: "none",
      dateHired: "2026-11-22",
      employmentStatus: "active",
      workLocation: "Pasig City",
      salaryGrade: 11,
      education: [],
      skillsText: "",
      governmentIds: { sss: "", philhealth: "", pagibig: "", tin: "" },
      documents: [],
      avatarColor: "#059669",
    };
  }

  return {
    firstName: employee.firstName,
    middleName: employee.middleName ?? "",
    lastName: employee.lastName,
    dateOfBirth: employee.dateOfBirth,
    gender: employee.gender,
    civilStatus: employee.civilStatus,
    nationality: employee.nationality,
    contactNumber: employee.contactNumber,
    email: employee.email,
    address: employee.address,
    emergencyContact: { ...employee.emergencyContact },
    employmentType: employee.employmentType,
    departmentId: employee.departmentId,
    positionId: employee.positionId,
    supervisorId: employee.supervisorId ?? "none",
    dateHired: employee.dateHired,
    employmentStatus: employee.employmentStatus,
    workLocation: employee.workLocation,
    salaryGrade: employee.salaryGrade,
    education: employee.education.map((record) => ({ ...record })),
    skillsText: employee.skills.join(", "),
    governmentIds: { ...employee.governmentIds },
    documents: employee.documents.map((document) => ({ ...document })),
    avatarColor: employee.avatarColor,
  };
}

export function employeeFormToInput(values: EmployeeFormValues): EmployeeCreateInput {
  return {
    firstName: values.firstName,
    middleName: textOrNull(values.middleName),
    lastName: values.lastName,
    dateOfBirth: values.dateOfBirth,
    gender: values.gender,
    civilStatus: values.civilStatus,
    nationality: values.nationality,
    contactNumber: values.contactNumber,
    email: values.email,
    address: values.address,
    emergencyContact: { ...values.emergencyContact },
    employmentType: values.employmentType,
    departmentId: values.departmentId,
    positionId: values.positionId,
    supervisorId: values.supervisorId === "none" ? null : values.supervisorId,
    dateHired: values.dateHired,
    employmentStatus: values.employmentStatus,
    workLocation: values.workLocation,
    salaryGrade: values.salaryGrade,
    education: values.education.map((record) => ({ ...record })),
    skills: splitSkills(values.skillsText),
    governmentIds: { ...values.governmentIds },
    documents: values.documents.map((document) => ({ ...document })),
    avatarColor: values.avatarColor || "#059669",
  };
}
