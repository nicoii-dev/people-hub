import type {
  Project,
  ProjectAssignment,
  ProjectAssignmentRole,
  ProjectTag,
} from "@/types/project";
import { mockTimestamp } from "./_common";
import { clientSeed } from "./clients";
import { employeeSeed } from "./employees";

const [acme, northwind, bluepeak, sunrise, greenfield] = clientSeed;

interface ProjectSeedInput {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  name: string;
  code: string;
  description: string;
  status: Project["status"];
  priority: Project["priority"];
  startDate: string;
  endDate: string;
  budget: number | null;
  billable?: boolean;
  createdDaysAgo: number;
  updatedDaysAgo: number;
}

function projectSeedItem(input: ProjectSeedInput): Project {
  return {
    ...input,
    billable: input.billable ?? true,
    createdById: "user-admin",
    createdByName: "Hector Administrator",
    createdAt: mockTimestamp(-input.createdDaysAgo),
    updatedAt: mockTimestamp(-input.updatedDaysAgo),
    deletedAt: null,
    tags: [],
    assignments: [],
  };
}

/** Stable UUIDs keep client/project links intact across mock reloads. */
export const projectSeed: Project[] = [
  projectSeedItem({
    id: "1f0a5c72-3b8e-4d16-9a51-7c2e4b8f1a01",
    clientId: acme.id,
    clientName: acme.name,
    clientCode: acme.code,
    name: "Website Redesign",
    code: "WEBRED",
    description: "Refresh the corporate site and customer portal.",
    status: "active",
    priority: "high",
    startDate: "2026-09-01",
    endDate: "2026-12-15",
    budget: 850000,
    createdDaysAgo: 75,
    updatedDaysAgo: 4,
  }),
  projectSeedItem({
    id: "2a6d1e93-4c7f-4b28-8e62-3d9f5c0a2b12",
    clientId: acme.id,
    clientName: acme.name,
    clientCode: acme.code,
    name: "ERP Rollout Phase 1",
    code: "ERP1",
    description: "Finance and inventory module rollout.",
    status: "planning",
    priority: "medium",
    startDate: "2026-11-01",
    endDate: "2027-03-31",
    budget: 1200000,
    createdDaysAgo: 60,
    updatedDaysAgo: 6,
  }),
  projectSeedItem({
    id: "3b7e2fa4-5d80-4c39-9f73-4e0a6d1b3c23",
    clientId: northwind.id,
    clientName: northwind.name,
    clientCode: northwind.code,
    name: "Warehouse Management System",
    code: "WMS",
    description: "Warehouse receiving and dispatch automation.",
    status: "active",
    priority: "urgent",
    startDate: "2026-08-15",
    endDate: "2026-11-30",
    budget: 950000,
    createdDaysAgo: 95,
    updatedDaysAgo: 2,
  }),
  projectSeedItem({
    id: "4c8f30b5-6e91-4d4a-a084-5f1b7e2c4d34",
    clientId: bluepeak.id,
    clientName: bluepeak.name,
    clientCode: bluepeak.code,
    name: "Mobile App MVP",
    code: "APPMVP",
    description: "First public release of the customer mobile app.",
    status: "active",
    priority: "high",
    startDate: "2026-07-01",
    endDate: "2026-12-20",
    budget: 780000,
    createdDaysAgo: 140,
    updatedDaysAgo: 9,
  }),
  projectSeedItem({
    id: "5d9041c6-7fa2-4e5b-b195-602c8f3d5e45",
    clientId: bluepeak.id,
    clientName: bluepeak.name,
    clientCode: bluepeak.code,
    name: "Customer Portal",
    code: "PORTAL",
    description: "Self-service account portal, paused pending feedback.",
    status: "on_hold",
    priority: "medium",
    startDate: "2026-06-01",
    endDate: "2026-10-31",
    budget: 620000,
    createdDaysAgo: 170,
    updatedDaysAgo: 15,
  }),
  projectSeedItem({
    id: "6ea152d7-80b3-4f6c-c2a6-713d904e6f56",
    clientId: bluepeak.id,
    clientName: bluepeak.name,
    clientCode: bluepeak.code,
    name: "Data Migration",
    code: "DATAMIG",
    description: "Legacy records migrated to the new platform.",
    status: "completed",
    priority: "low",
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    budget: 450000,
    createdDaysAgo: 250,
    updatedDaysAgo: 180,
  }),
  projectSeedItem({
    id: "7fb263e8-91c4-4a7d-d3b7-824ea15f7067",
    clientId: sunrise.id,
    clientName: sunrise.name,
    clientCode: sunrise.code,
    name: "Clinic Scheduling System",
    code: "CLINIC",
    description: "Appointment and practitioner scheduling.",
    status: "active",
    priority: "high",
    startDate: "2026-10-01",
    endDate: "2027-01-31",
    budget: 700000,
    createdDaysAgo: 50,
    updatedDaysAgo: 11,
  }),
  projectSeedItem({
    id: "80c374f9-a2d5-4b8e-e4c8-935fb2608178",
    clientId: greenfield.id,
    clientName: greenfield.name,
    clientCode: greenfield.code,
    name: "Market Research",
    code: "MKTRES",
    description: "Regional demand study and recommendations.",
    status: "planning",
    priority: "low",
    startDate: "2026-12-01",
    endDate: "2027-02-28",
    budget: 250000,
    billable: false,
    createdDaysAgo: 30,
    updatedDaysAgo: 20,
  }),
];

function findProject(code: string) {
  const project = projectSeed.find((item) => item.code === code);
  if (!project) throw new Error(`Missing demo project ${code}`);
  return project;
}

function tagSeedItem(
  id: string,
  projectCode: string,
  name: string,
  color: string,
): ProjectTag {
  const project = findProject(projectCode);
  return {
    id,
    projectId: project.id,
    name,
    color,
    createdAt: mockTimestamp(-70),
    updatedAt: mockTimestamp(-10),
  };
}

export const projectTagSeed: ProjectTag[] = [
  tagSeedItem("a1010000-0000-4000-8000-000000000001", "WEBRED", "Frontend", "#2563EB"),
  tagSeedItem("a1010000-0000-4000-8000-000000000002", "WEBRED", "Backend", "#16A34A"),
  tagSeedItem("a1010000-0000-4000-8000-000000000003", "WEBRED", "QA", "#F59E0B"),
  tagSeedItem("a1010000-0000-4000-8000-000000000004", "ERP1", "Finance", "#0EA5E9"),
  tagSeedItem("a1010000-0000-4000-8000-000000000005", "ERP1", "Inventory", "#8B5CF6"),
  tagSeedItem("a1010000-0000-4000-8000-000000000006", "WMS", "Warehouse", "#14B8A6"),
  tagSeedItem("a1010000-0000-4000-8000-000000000007", "WMS", "Integration", "#6366F1"),
  tagSeedItem("a1010000-0000-4000-8000-000000000008", "APPMVP", "Mobile", "#EC4899"),
  tagSeedItem("a1010000-0000-4000-8000-000000000009", "APPMVP", "API", "#3B82F6"),
  tagSeedItem("a1010000-0000-4000-8000-000000000010", "PORTAL", "UX", "#A855F7"),
  tagSeedItem("a1010000-0000-4000-8000-000000000011", "CLINIC", "Scheduling", "#22C55E"),
];

function assignmentSeedItem(
  id: string,
  projectCode: string,
  employeeIndex: number,
  role: ProjectAssignmentRole,
): ProjectAssignment {
  const project = findProject(projectCode);
  const employee = employeeSeed[employeeIndex];
  return {
    id,
    projectId: project.id,
    projectName: project.name,
    projectCode: project.code,
    employeeId: employee.id,
    employeeNumber: employee.employeeNumber,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    role,
    assignedById: "user-admin",
    assignedByName: "Hector Administrator",
    assignedAt: mockTimestamp(-60),
    createdAt: mockTimestamp(-60),
    updatedAt: mockTimestamp(-60),
  };
}

export const projectAssignmentSeed: ProjectAssignment[] = [
  assignmentSeedItem("b2020000-0000-4000-8000-000000000001", "WEBRED", 20, "lead"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000002", "WEBRED", 0, "member"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000003", "WEBRED", 4, "reviewer"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000004", "ERP1", 1, "lead"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000005", "ERP1", 2, "member"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000006", "WMS", 20, "lead"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000007", "WMS", 3, "member"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000008", "APPMVP", 0, "lead"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000009", "APPMVP", 20, "reviewer"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000010", "PORTAL", 20, "member"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000011", "DATAMIG", 4, "member"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000012", "CLINIC", 20, "lead"),
  assignmentSeedItem("b2020000-0000-4000-8000-000000000013", "MKTRES", 5, "reviewer"),
];
