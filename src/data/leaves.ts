import { differenceInCalendarDays, parseISO } from "date-fns";
import type { LeaveBalance, LeaveRequest, LeaveStatus, LeaveType } from "@/types/leave";
import { mockDate, mockTimestamp } from "./_common";
import { employeeSeed } from "./employees";

const leaveTypes: LeaveType[] = [
  "Vacation Leave",
  "Sick Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Unpaid Leave",
];

const statuses: LeaveStatus[] = [
  "approved",
  "approved",
  "pending",
  "approved",
  "rejected",
  "approved",
  "pending",
  "cancelled",
];

const reasons: Record<LeaveType, string> = {
  "Vacation Leave": "Family trip outside Metro Manila",
  "Sick Leave": "Medical consultation and recovery",
  "Emergency Leave": "Family emergency requiring onsite assistance",
  "Maternity Leave": "Maternity leave as scheduled by physician",
  "Paternity Leave": "Paternity leave for newborn child",
  "Bereavement Leave": "Attend to family bereavement",
  "Unpaid Leave": "Personal matters, unpaid time off",
};

export const leaveSeed: LeaveRequest[] = Array.from({ length: 34 }, (_, index) => {
  const employee = employeeSeed[(index * 5 + 2) % employeeSeed.length];
  const type = leaveTypes[index % leaveTypes.length];
  const status = statuses[index % statuses.length];
  const startOffset = index < 6 ? -3 + index : -45 + ((index * 7) % 70);
  const startDate = mockDate(startOffset);
  const duration = 1 + (index % 3);
  const endDate = mockDate(startOffset + duration - 1);
  const days = Math.max(1, differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1);
  const approver = employeeSeed.find((item) => item.id === employee.supervisorId);

  return {
    id: `LEAVE-${String(index + 1).padStart(3, "0")}`,
    employeeId: employee.id,
    type,
    startDate,
    endDate,
    days,
    reason: reasons[type],
    status,
    approvedBy: status === "approved" ? (approver?.id ?? "EMP-005") : null,
    approvedAt: status === "approved" ? mockTimestamp(startOffset - 2, 10) : null,
    rejectionReason: status === "rejected" ? "Insured leave quota for the quarter" : null,
    createdAt: mockTimestamp(startOffset - 6, 8 + (index % 3)),
  };
});

const standardBalances: Record<LeaveType, number> = {
  "Vacation Leave": 12,
  "Sick Leave": 12,
  "Emergency Leave": 3,
  "Maternity Leave": 105,
  "Paternity Leave": 7,
  "Bereavement Leave": 3,
  "Unpaid Leave": 0,
};

export const leaveBalanceSeed: LeaveBalance[] = employeeSeed.flatMap((employee) =>
  leaveTypes.map((type) => {
    const used = leaveSeed
      .filter(
        (request) =>
          request.employeeId === employee.id &&
          request.type === type &&
          request.status === "approved",
      )
      .reduce((sum, request) => sum + request.days, 0);
    const total = standardBalances[type];

    return {
      employeeId: employee.id,
      type,
      total,
      used,
      remaining: Math.max(0, total - used),
    };
  }),
);
