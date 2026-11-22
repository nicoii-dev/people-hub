import type { AttendanceStatus } from "@/types/attendance";
import type { CivilStatus, EmploymentType, EmployeeStatus, Gender } from "@/types/employee";
import type { EmployeeDocument } from "@/types/employee";
import type { LeaveStatus, LeaveType } from "@/types/leave";
import type { PayrollPeriodStatus } from "@/types/payroll";
import type {
  PerformanceGoal,
  PerformanceReview,
  ReviewStatus,
} from "@/types/performance";
import type { Position } from "@/types/position";
import type { Interview, JobOpening, RecruitmentStage } from "@/types/recruitment";
import type { SystemUserStatus } from "@/types/settings";

export const EMPLOYEE_STATUSES = ["active", "inactive", "on_leave", "archived"] as const satisfies readonly EmployeeStatus[];
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern"] as const satisfies readonly EmploymentType[];
export const GENDERS = ["Male", "Female"] as const satisfies readonly Gender[];
export const CIVIL_STATUSES = ["Single", "Married", "Divorced", "Widowed"] as const satisfies readonly CivilStatus[];
export const POSITION_LEVELS = ["Junior", "Mid", "Senior", "Lead", "Manager", "Director"] as const satisfies readonly Position["level"][];
export const WORK_LOCATIONS = ["Pasig City", "Makati City", "Cebu City", "Remote"] as const;
export const DOCUMENT_TYPES = ["Contract", "Resume", "Certificate", "Government ID", "Other"] as const satisfies readonly EmployeeDocument["type"][];
export const ATTENDANCE_STATUSES = ["present", "late", "absent", "half_day", "on_leave", "overtime"] as const satisfies readonly AttendanceStatus[];
export const LEAVE_STATUSES = ["pending", "approved", "rejected", "cancelled"] as const satisfies readonly LeaveStatus[];
export const LEAVE_TYPES = [
  "Vacation Leave",
  "Sick Leave",
  "Emergency Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Unpaid Leave",
] as const satisfies readonly LeaveType[];
export const PAYROLL_PERIOD_STATUSES = ["draft", "preview", "processed", "paid"] as const satisfies readonly PayrollPeriodStatus[];
export const RECRUITMENT_STAGES = ["applied", "screening", "interview", "assessment", "offered", "hired", "rejected"] as const satisfies readonly RecruitmentStage[];
export const JOB_OPENING_STATUSES = ["open", "on_hold", "closed"] as const satisfies readonly JobOpening["status"][];
export const INTERVIEW_MODES = ["Onsite", "Video call", "Phone"] as const satisfies readonly Interview["mode"][];
export const INTERVIEW_STATUSES = ["scheduled", "completed", "cancelled"] as const satisfies readonly Interview["status"][];
export const REVIEW_STATUSES = ["draft", "submitted", "acknowledged"] as const satisfies readonly ReviewStatus[];
export const RATING_SCORES = [1, 2, 3, 4, 5] as const satisfies readonly PerformanceReview["rating"][];
export const GOAL_STATUSES = ["on_track", "at_risk", "completed"] as const satisfies readonly PerformanceGoal["status"][];
export const SYSTEM_USER_STATUSES = ["active", "invited", "suspended"] as const satisfies readonly SystemUserStatus[];

export const MOCK_TODAY = "2026-11-22";

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "on_leave", label: "On Leave" },
  { value: "archived", label: "Archived" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({ value, label: value }));
export const GENDER_OPTIONS = GENDERS.map((value) => ({ value, label: value }));
export const CIVIL_STATUS_OPTIONS = CIVIL_STATUSES.map((value) => ({ value, label: value }));
export const POSITION_LEVEL_OPTIONS = POSITION_LEVELS.map((value) => ({ value, label: value }));
export const WORK_LOCATION_OPTIONS = WORK_LOCATIONS.map((value) => ({ value, label: value }));
export const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES.map((value) => ({ value, label: value }));
export const ATTENDANCE_STATUS_OPTIONS = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "half_day", label: "Half Day" },
  { value: "on_leave", label: "On Leave" },
  { value: "overtime", label: "Overtime" },
] as const;
export const LEAVE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const;
export const LEAVE_TYPE_OPTIONS = LEAVE_TYPES.map((value) => ({ value, label: value }));
export const PAYROLL_PERIOD_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "preview", label: "Preview" },
  { value: "processed", label: "Processed" },
  { value: "paid", label: "Paid" },
] as const;
export const RECRUITMENT_STAGE_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "screening", label: "Screening" },
  { value: "interview", label: "Interview" },
  { value: "assessment", label: "Assessment" },
  { value: "offered", label: "Offered" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
] as const;
export const JOB_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "on_hold", label: "On Hold" },
  { value: "closed", label: "Closed" },
] as const;
export const INTERVIEW_MODE_OPTIONS = INTERVIEW_MODES.map((value) => ({ value, label: value }));
export const INTERVIEW_STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;
export const REVIEW_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "acknowledged", label: "Acknowledged" },
] as const;
export const RATING_OPTIONS = RATING_SCORES.map((value) => ({
  value: String(value),
  label: `${value} / 5`,
}));
export const GOAL_STATUS_OPTIONS = [
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "completed", label: "Completed" },
] as const;
export const REVIEW_PERIOD_OPTIONS = [
  { value: "Q3 2026", label: "Q3 2026" },
  { value: "Q4 2026", label: "Q4 2026" },
  { value: "Q1 2027", label: "Q1 2027" },
] as const;
export const SYSTEM_USER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "suspended", label: "Suspended" },
] as const;

export const NO_SELECTION = "none";
