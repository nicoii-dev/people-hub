export interface ActivityItem {
  id: string;
  employeeId: string;
  action: string;
  detail: string;
  occurredAt: string;
  kind: "hire" | "leave" | "attendance" | "payroll" | "performance";
}

export interface PendingApproval {
  id: string;
  type: "leave" | "attendance" | "payroll";
  referenceId: string;
  employeeId: string;
  label: string;
  submittedAt: string;
}

export interface DashboardSummary {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  newHiresThisMonth: number;
  pendingLeaveRequests: number;
  attendanceRate: number;
  employeeGrowth: Array<{ month: string; hires: number }>;
  attendanceOverview: Array<{ date: string; present: number; late: number; absent: number }>;
  departmentDistribution: Array<{ department: string; count: number }>;
  recentActivities: ActivityItem[];
  upcomingBirthdays: Array<{ employeeId: string; name: string; dateOfBirth: string }>;
  pendingApprovals: PendingApproval[];
}
