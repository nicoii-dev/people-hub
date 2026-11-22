import type { ListParams } from "./api";

export type EmployeeStatus = "active" | "inactive" | "on_leave" | "archived";
export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Intern";
export type Gender = "Male" | "Female";
export type CivilStatus = "Single" | "Married" | "Divorced" | "Widowed";

export interface EducationRecord {
  id: string;
  school: string;
  degree: string;
  yearGraduated: number;
}

export interface GovernmentIds {
  sss: string;
  philhealth: string;
  pagibig: string;
  tin: string;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: "Contract" | "Resume" | "Certificate" | "Government ID" | "Other";
  uploadedAt: string;
  sizeKb: number;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  contactNumber: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  civilStatus: CivilStatus;
  nationality: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: EmergencyContact;
  employmentType: EmploymentType;
  departmentId: string;
  positionId: string;
  supervisorId: string | null;
  dateHired: string;
  employmentStatus: EmployeeStatus;
  workLocation: string;
  salaryGrade: number;
  education: EducationRecord[];
  skills: string[];
  governmentIds: GovernmentIds;
  documents: EmployeeDocument[];
  avatarColor: string;
}

export type EmployeeCreateInput = Omit<Employee, "id" | "employeeNumber" | "avatarColor"> & {
  avatarColor?: string;
};

export type EmployeeUpdateInput = Partial<EmployeeCreateInput>;

export interface EmployeeQueryParams extends ListParams {
  departmentId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
}
