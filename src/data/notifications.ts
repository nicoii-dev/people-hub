import type { AppNotification } from "@/types/notification";
import { mockTimestamp } from "./_common";

export const notificationSeed: AppNotification[] = [
  {
    id: "NOTIF-001",
    title: "3 leave requests awaiting approval",
    message: "Employees in Engineering and Finance submitted new leave requests.",
    kind: "leave",
    createdAt: mockTimestamp(0, 8),
    read: false,
    href: null,
  },
  {
    id: "NOTIF-002",
    title: "Payroll preview is ready",
    message: "November 2026 — 2nd Half mock payroll preview has been generated.",
    kind: "payroll",
    createdAt: mockTimestamp(-1, 9),
    read: false,
    href: null,
  },
  {
    id: "NOTIF-003",
    title: "Attendance correction submitted",
    message: "EMP-004 requested a manual time-in adjustment for yesterday.",
    kind: "attendance",
    createdAt: mockTimestamp(-1, 14),
    read: false,
    href: null,
  },
  {
    id: "NOTIF-004",
    title: "Interview scheduled",
    message: "Jordan Mendoza is scheduled for a Senior Full-Stack Engineer interview.",
    kind: "recruitment",
    createdAt: mockTimestamp(-2, 10),
    read: true,
    href: null,
  },
  {
    id: "NOTIF-005",
    title: "Performance review reminder",
    message: "Q4 2026 reviews are due by the end of the month.",
    kind: "system",
    createdAt: mockTimestamp(-3, 11),
    read: true,
    href: null,
  },
];
