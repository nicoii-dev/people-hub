import { format, parseISO, subDays } from "date-fns";
import {
  LEAVE_TYPES,
  MOCK_TODAY,
  RATING_SCORES,
  RECRUITMENT_STAGE_OPTIONS,
} from "@/config/constants";
import { env } from "@/config/env";
import { attendanceSeed } from "@/data/attendance";
import { departmentSeed } from "@/data/departments";
import { employeeSeed } from "@/data/employees";
import { leaveSeed } from "@/data/leaves";
import { payrollRecordSeed } from "@/data/payroll";
import { performanceReviewSeed } from "@/data/performance";
import { applicationSeed, jobOpeningSeed } from "@/data/recruitment";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type { ReportsData } from "@/types/report";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
} from "./mock/persistence";

export interface ReportsService {
  getReports(departmentId?: string): ServiceResult<ReportsData>;
}

const mockReportsService: ReportsService = {
  async getReports(departmentId) {
    await mockDelay(140);

    const allEmployees = readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
    const employees = departmentId
      ? allEmployees.filter((employee) => employee.departmentId === departmentId)
      : allEmployees;
    const employeeIds = new Set(employees.map((employee) => employee.id));
    const employeeDepartmentById = new Map(allEmployees.map((employee) => [employee.id, employee.departmentId]));

    const departments = readCollection(MOCK_COLLECTIONS.departments, departmentSeed).filter(
      (department) => !departmentId || department.id === departmentId,
    );
    const attendance = readCollection(MOCK_COLLECTIONS.attendance, attendanceSeed).filter((record) =>
      employeeIds.has(record.employeeId),
    );
    const leaves = readCollection(MOCK_COLLECTIONS.leaves, leaveSeed).filter((request) =>
      employeeIds.has(request.employeeId),
    );
    const payrollRecords = readCollection(MOCK_COLLECTIONS.payrollRecords, payrollRecordSeed).filter((record) =>
      employeeIds.has(record.employeeId),
    );
    const jobs = readCollection(MOCK_COLLECTIONS.jobs, jobOpeningSeed).filter(
      (job) => !departmentId || job.departmentId === departmentId,
    );
    const jobIds = new Set(jobs.map((job) => job.id));
    const applications = readCollection(MOCK_COLLECTIONS.applications, applicationSeed).filter((application) =>
      jobIds.has(application.jobId),
    );
    const reviews = readCollection(MOCK_COLLECTIONS.reviews, performanceReviewSeed).filter((review) =>
      employeeIds.has(review.employeeId),
    );

    const presentCount = attendance.filter(
      (record) => record.status === "present" || record.status === "overtime",
    ).length;
    const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
    const payrollCost = payrollRecords.reduce((total, record) => total + record.netPay, 0);
    const averageRating = reviews.length
      ? Number((reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1))
      : 0;

    const today = parseISO(MOCK_TODAY);
    const attendanceTrend = Array.from({ length: 7 }, (_, index) => {
      const date = format(subDays(today, 6 - index), "yyyy-MM-dd");
      const dayRecords = attendance.filter((record) => record.date === date);
      return {
        date: format(parseISO(date), "MMM d"),
        present: dayRecords.filter(
          (record) => record.status === "present" || record.status === "overtime",
        ).length,
        late: dayRecords.filter((record) => record.status === "late").length,
        absent: dayRecords.filter(
          (record) => record.status === "absent" || record.status === "on_leave",
        ).length,
      };
    });

    const headcountByDepartment = departments.map((department) => ({
      department: department.name,
      employees: employees.filter((employee) => employee.departmentId === department.id).length,
      payrollCost: payrollRecords
        .filter((record) => employeeDepartmentById.get(record.employeeId) === department.id)
        .reduce((total, record) => total + record.netPay, 0),
    }));

    const leaveByType = LEAVE_TYPES.map((type) => {
      const matching = leaves.filter((request) => request.type === type);
      return {
        type,
        days: matching.reduce((total, request) => total + request.days, 0),
        requests: matching.length,
      };
    });

    const recruitmentFunnel = RECRUITMENT_STAGE_OPTIONS.map((option) => ({
      stage: option.label,
      count: applications.filter((application) => application.stage === option.value).length,
    }));

    const ratingDistribution = RATING_SCORES.map((score) => ({
      rating: String(score),
      count: reviews.filter((review) => review.rating === score).length,
    }));

    const data: ReportsData = {
      generatedAt: MOCK_TODAY,
      summary: {
        headcount: employees.length,
        activeEmployees: employees.filter((employee) => employee.employmentStatus === "active").length,
        attendanceRate,
        pendingLeaves: leaves.filter((request) => request.status === "pending").length,
        payrollCost,
        openJobs: jobs.filter((job) => job.status === "open").length,
        averageRating,
      },
      headcountByDepartment,
      attendanceTrend,
      leaveByType,
      recruitmentFunnel,
      ratingDistribution,
    };

    return success(data, "Report generated successfully");
  },
};

const apiReportsService: ReportsService = {
  getReports: (departmentId) =>
    apiClient.get<ReportsData>(API_ENDPOINTS.reports, departmentId ? { departmentId } : undefined),
};

export const reportsService: ReportsService = env.useMockData
  ? mockReportsService
  : apiReportsService;
