import type { ActivityItem, PendingApproval } from "@/types/dashboard";
import { mockTimestamp } from "./_common";

export const activitySeed: ActivityItem[] = [
  {
    id: "ACT-001",
    employeeId: "EMP-024",
    action: "New hire onboarded",
    detail: "Nico Manalo joined as Executive Assistant",
    occurredAt: mockTimestamp(0, 9),
    kind: "hire",
  },
  {
    id: "ACT-002",
    employeeId: "EMP-020",
    action: "New hire onboarded",
    detail: "Analyn Cordero joined as Support Specialist",
    occurredAt: mockTimestamp(-1, 13),
    kind: "hire",
  },
  {
    id: "ACT-003",
    employeeId: "EMP-011",
    action: "Leave approved",
    detail: "Earl Domingo's sick leave was approved",
    occurredAt: mockTimestamp(-2, 10),
    kind: "leave",
  },
  {
    id: "ACT-004",
    employeeId: "EMP-002",
    action: "Attendance flagged",
    detail: "Kenji Nakamura was marked late for the shift",
    occurredAt: mockTimestamp(-3, 9),
    kind: "attendance",
  },
  {
    id: "ACT-005",
    employeeId: "EMP-007",
    action: "Performance review submitted",
    detail: "Janry Mercado's Q4 review was submitted",
    occurredAt: mockTimestamp(-4, 15),
    kind: "performance",
  },
  {
    id: "ACT-006",
    employeeId: "EMP-009",
    action: "Payroll processed",
    detail: "November 2026 — 1st Half payroll was processed",
    occurredAt: mockTimestamp(-5, 8),
    kind: "payroll",
  },
];

export const pendingApprovalSeed: PendingApproval[] = [
  {
    id: "APPR-001",
    type: "leave",
    referenceId: "LEAVE-003",
    employeeId: "EMP-017",
    label: "Vacation Leave — 2 days",
    submittedAt: mockTimestamp(-2, 8),
  },
  {
    id: "APPR-002",
    type: "leave",
    referenceId: "LEAVE-007",
    employeeId: "EMP-021",
    label: "Sick Leave — 1 day",
    submittedAt: mockTimestamp(-1, 10),
  },
  {
    id: "APPR-003",
    type: "attendance",
    referenceId: "ATT-EMP004-20261120",
    employeeId: "EMP-004",
    label: "Manual attendance adjustment",
    submittedAt: mockTimestamp(-1, 14),
  },
  {
    id: "APPR-004",
    type: "payroll",
    referenceId: "PAY-2026-11-B",
    employeeId: "EMP-009",
    label: "Payroll preview approval",
    submittedAt: mockTimestamp(0, 8),
  },
];
