export interface ReportSummary {
  headcount: number;
  activeEmployees: number;
  attendanceRate: number;
  pendingLeaves: number;
  payrollCost: number;
  openJobs: number;
  averageRating: number;
}

export interface DepartmentReportItem {
  department: string;
  employees: number;
  payrollCost: number;
}

export interface AttendanceTrendItem {
  date: string;
  present: number;
  late: number;
  absent: number;
}

export interface LeaveTypeReportItem {
  type: string;
  days: number;
  requests: number;
}

export interface RecruitmentFunnelItem {
  stage: string;
  count: number;
}

export interface RatingDistributionItem {
  rating: string;
  count: number;
}

export interface ReportsData {
  generatedAt: string;
  summary: ReportSummary;
  headcountByDepartment: DepartmentReportItem[];
  attendanceTrend: AttendanceTrendItem[];
  leaveByType: LeaveTypeReportItem[];
  recruitmentFunnel: RecruitmentFunnelItem[];
  ratingDistribution: RatingDistributionItem[];
}
