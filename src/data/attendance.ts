import { format, isWeekend, parseISO } from "date-fns";
import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { mockDate } from "./_common";
import { employeeSeed } from "./employees";

function time(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const statusCycle: AttendanceStatus[] = [
  "present",
  "present",
  "present",
  "late",
  "present",
  "overtime",
  "present",
  "half_day",
];

export const attendanceSeed: AttendanceRecord[] = employeeSeed.flatMap((employee, employeeIndex) => {
  const records: AttendanceRecord[] = [];

  for (let daysAgo = 20; daysAgo >= 0; daysAgo -= 1) {
    const date = mockDate(-daysAgo);
    if (isWeekend(parseISO(date))) continue;

    const cycleIndex = (employeeIndex + daysAgo) % statusCycle.length;
    let status = statusCycle[cycleIndex];

    if (employee.employmentStatus === "on_leave") status = "on_leave";
    if (employee.employmentStatus === "inactive" || employee.employmentStatus === "archived") {
      status = "absent";
    }
    if (employee.employmentStatus === "active" && daysAgo === 0 && employeeIndex % 11 === 0) {
      status = "on_leave";
    }

    const isAbsent = status === "absent";
    const isOnLeave = status === "on_leave";
    const lateMinutes = status === "late" ? 10 + ((employeeIndex * 3) % 26) : 0;
    const overtimeMinutes = status === "overtime" ? 45 + ((employeeIndex * 5) % 90) : 0;
    const undertimeMinutes = status === "half_day" ? 180 + (employeeIndex % 3) * 15 : 0;
    const timeIn = isAbsent || isOnLeave ? null : time(8, lateMinutes > 0 ? 8 + lateMinutes : 1 + (employeeIndex % 4));
    const timeOut = isAbsent || isOnLeave ? null : time(17 + (overtimeMinutes > 0 ? 2 : 0), 1 + (employeeIndex % 5));

    records.push({
      id: `ATT-${employee.id}-${format(parseISO(date), "yyyyMMdd")}`,
      employeeId: employee.id,
      date,
      timeIn,
      timeOut,
      breakMinutes: isAbsent || isOnLeave ? 0 : 60,
      status,
      lateMinutes,
      undertimeMinutes,
      overtimeMinutes,
      workLocation: employee.workLocation,
      remarks:
        status === "late"
          ? "Reported late due to traffic"
          : status === "overtime"
            ? "Approved overtime for release support"
            : status === "half_day"
              ? "Half-day approved by supervisor"
              : isOnLeave
                ? "Approved leave for the day"
                : isAbsent
                  ? "No time-in recorded"
                  : "Regular shift completed",
      source: employeeIndex % 17 === 0 && daysAgo < 5 ? "manual" : "biometric",
    });
  }

  return records;
});
