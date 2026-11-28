import type { TimeEntry } from "@/types/time-entry";
import { employeeSeed } from "./employees";
import { projectSeed } from "./projects";

/** Frontend equivalents of the backend demo role users, keyed as in the seeder. */
const demoEmployees = {
  admin: "EMP-005",
  "hr-head": "EMP-001",
  "hr-staff": "EMP-006",
  manager: "EMP-002",
  employee: "EMP-003",
} as const;

type DemoEmployeeKey = keyof typeof demoEmployees;

interface TimeEntrySeedInput {
  projectCode: string;
  employeeKey: DemoEmployeeKey;
  workDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  billable: boolean;
  description: string;
}

/** Mirrors backend DEMO_TIME_ENTRIES: same ids, dates and durations. */
const entries: TimeEntrySeedInput[] = [
  { projectCode: "WEBRED", employeeKey: "manager", workDate: "2026-11-16", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Design review and sprint planning" },
  { projectCode: "WEBRED", employeeKey: "employee", workDate: "2026-11-16", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Homepage component implementation" },
  { projectCode: "WEBRED", employeeKey: "hr-staff", workDate: "2026-11-17", startTime: "10:00", endTime: "15:00", durationMinutes: 300, billable: false, description: "Content and accessibility review" },
  { projectCode: "WEBRED", employeeKey: "manager", workDate: "2026-11-18", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Integration handover with backend team" },
  { projectCode: "ERP1", employeeKey: "admin", workDate: "2026-11-17", startTime: "08:00", endTime: "16:00", durationMinutes: 480, billable: true, description: "Finance requirements workshop" },
  { projectCode: "ERP1", employeeKey: "hr-staff", workDate: "2026-11-19", startTime: "09:00", endTime: "12:00", durationMinutes: 180, billable: true, description: "Inventory process documentation" },
  { projectCode: "WMS", employeeKey: "manager", workDate: "2026-11-20", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Warehouse interface architecture" },
  { projectCode: "WMS", employeeKey: "employee", workDate: "2026-11-20", startTime: "09:00", endTime: "15:00", durationMinutes: 360, billable: true, description: "Receiving API implementation" },
  { projectCode: "WMS", employeeKey: "employee", workDate: "2026-11-21", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Dispatch module bug fixes" },
  { projectCode: "APPMVP", employeeKey: "employee", workDate: "2026-11-23", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Mobile onboarding flow" },
  { projectCode: "APPMVP", employeeKey: "manager", workDate: "2026-11-23", startTime: "13:00", endTime: "17:00", durationMinutes: 240, billable: false, description: "Release readiness review" },
  { projectCode: "APPMVP", employeeKey: "employee", workDate: "2026-11-24", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Push notification integration" },
  { projectCode: "PORTAL", employeeKey: "manager", workDate: "2026-11-10", startTime: "09:00", endTime: "12:00", durationMinutes: 180, billable: true, description: "Portal UX findings" },
  { projectCode: "DATAMIG", employeeKey: "hr-staff", workDate: "2026-05-20", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Legacy HR records validation" },
  { projectCode: "DATAMIG", employeeKey: "hr-head", workDate: "2026-05-21", startTime: "09:00", endTime: "14:00", durationMinutes: 300, billable: true, description: "Migration sign-off" },
  { projectCode: "CLINIC", employeeKey: "manager", workDate: "2026-11-24", startTime: "09:00", endTime: "17:00", durationMinutes: 480, billable: true, description: "Scheduling engine improvements" },
  { projectCode: "CLINIC", employeeKey: "hr-head", workDate: "2026-11-25", startTime: "10:00", endTime: "15:00", durationMinutes: 300, billable: false, description: "Clinician workflow review" },
  { projectCode: "MKTRES", employeeKey: "hr-head", workDate: "2026-11-12", startTime: "09:00", endTime: "13:00", durationMinutes: 240, billable: true, description: "Regional demand interviews" },
];

function demoId(index: number) {
  return `11111111-1111-4111-8111-${String(index).padStart(12, "0")}`;
}

export const timeEntrySeed: TimeEntry[] = entries.map((entry, index) => {
  const project = projectSeed.find((item) => item.code === entry.projectCode);
  const employee = employeeSeed.find(
    (item) => item.id === demoEmployees[entry.employeeKey],
  );
  if (!project || !employee) {
    throw new Error(`Demo time entry ${entry.projectCode}/${entry.employeeKey} was not seeded`);
  }

  return {
    id: demoId(index + 1),
    companyId: "demo-company",
    projectId: project.id,
    projectName: project.name,
    projectCode: project.code,
    employeeId: employee.id,
    employeeNumber: employee.employeeNumber,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    workDate: entry.workDate,
    startTime: `${entry.workDate}T${entry.startTime}:00.000Z`,
    endTime: `${entry.workDate}T${entry.endTime}:00.000Z`,
    durationMinutes: entry.durationMinutes,
    billable: entry.billable,
    description: entry.description,
    createdAt: `${entry.workDate}T18:00:00.000Z`,
    updatedAt: `${entry.workDate}T18:00:00.000Z`,
    deletedAt: null,
  };
});
