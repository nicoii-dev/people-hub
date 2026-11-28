import { format, parseISO, subMonths } from "date-fns";
import { activitySeed, pendingApprovalSeed } from "@/data/dashboard";
import { attendanceSeed } from "@/data/attendance";
import { departmentSeed } from "@/data/departments";
import { employeeSeed } from "@/data/employees";
import { leaveSeed } from "@/data/leaves";
import { MOCK_TODAY, mockDate } from "@/data/_common";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type { DashboardSummary } from "@/types/dashboard";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
} from "./mock/persistence";

export interface DashboardService {
  getSummary(): ServiceResult<DashboardSummary>;
}

const mockDashboardService: DashboardService = {
  async getSummary() {
    await mockDelay(120);

    const employees = readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
    const attendance = readCollection(MOCK_COLLECTIONS.attendance, attendanceSeed);
    const departments = readCollection(MOCK_COLLECTIONS.departments, departmentSeed);
    const leaves = readCollection(MOCK_COLLECTIONS.leaves, leaveSeed);

    const onLeaveToday = attendance.filter(
      (record) => record.date === MOCK_TODAY && record.status === "on_leave",
    ).length;
    const attendanceRate = attendance.length
      ? Math.round(
          (attendance.filter((record) => record.status === "present" || record.status === "overtime").length /
            attendance.length) *
            100,
        )
      : 0;

    const employeeGrowth = Array.from({ length: 6 }, (_, index) => {
      const monthDate = subMonths(parseISO(MOCK_TODAY), 5 - index);
      const label = format(monthDate, "MMM yyyy");
      return {
        month: label,
        hires: employees.filter((employee) => format(parseISO(employee.dateHired), "MMM yyyy") === label).length,
      };
    });

    const attendanceOverview = Array.from({ length: 7 }, (_, index) => {
      const date = mockDate(index - 6);
      const dayRecords = attendance.filter((record) => record.date === date);
      return {
        date: format(parseISO(date), "MMM d"),
        present: dayRecords.filter((record) => record.status === "present" || record.status === "overtime").length,
        late: dayRecords.filter((record) => record.status === "late").length,
        absent: dayRecords.filter((record) => record.status === "absent" || record.status === "on_leave").length,
      };
    });

    const departmentDistribution = departments.map((department) => ({
      department: department.name,
      count: employees.filter((employee) => employee.departmentId === department.id).length,
    }));

    const todayMonthDay = format(parseISO(MOCK_TODAY), "MM-dd");
    const upcomingBirthdays = employees
      .map((employee) => {
        const monthDay = format(parseISO(employee.dateOfBirth), "MM-dd");
        const upcoming = parseISO(`2026-${monthDay}`);
        const daysAway = Math.round(
          (upcoming.getTime() - parseISO(`2026-${todayMonthDay}`).getTime()) / 86_400_000,
        );
        return { employeeId: employee.id, name: `${employee.firstName} ${employee.lastName}`, dateOfBirth: employee.dateOfBirth, daysAway };
      })
      .filter((employee) => employee.daysAway >= 0 && employee.daysAway <= 30)
      .sort((a, b) => a.daysAway - b.daysAway)
      .map((employee) => ({
        employeeId: employee.employeeId,
        name: employee.name,
        dateOfBirth: employee.dateOfBirth,
      }));

    const summary: DashboardSummary = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((employee) => employee.employmentStatus === "active").length,
      onLeaveToday,
      newHiresThisMonth: employees.filter((employee) => employee.dateHired.startsWith("2026-11")).length,
      pendingLeaveRequests: leaves.filter((request) => request.status === "pending").length,
      attendanceRate,
      employeeGrowth,
      attendanceOverview,
      departmentDistribution,
      recentActivities: activitySeed,
      upcomingBirthdays,
      pendingApprovals: pendingApprovalSeed,
    };

    return success(summary, "Dashboard summary calculated successfully");
  },
};

// The API has no dashboard controller yet, so this screen stays local.
export const dashboardService: DashboardService = mockDashboardService;
