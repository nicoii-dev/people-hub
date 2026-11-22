import type { PerformanceGoal, PerformanceReview, ReviewStatus } from "@/types/performance";
import { mockDate, mockTimestamp } from "./_common";
import { employeeSeed } from "./employees";

const statuses: ReviewStatus[] = ["submitted", "submitted", "acknowledged", "draft"];
const ratings: Array<1 | 2 | 3 | 4 | 5> = [5, 4, 4, 3, 5, 4];

export const performanceReviewSeed: PerformanceReview[] = employeeSeed
  .filter((employee) => employee.employmentStatus === "active")
  .slice(0, 12)
  .map((employee, index) => ({
    id: `REV-${String(index + 1).padStart(3, "0")}`,
    employeeId: employee.id,
    reviewerId: employee.supervisorId ?? "EMP-005",
    period: index % 2 === 0 ? "Q3 2026" : "Q4 2026",
    kpis: [
      {
        id: `KPI-${index + 1}-1`,
        name: "Delivery reliability",
        target: "95% of commitments completed on time",
        actual: `${88 + (index % 10)}% completed on time`,
        score: 4 + (index % 2),
      },
      {
        id: `KPI-${index + 1}-2`,
        name: "Quality",
        target: "Fewer than 3 escalations per quarter",
        actual: `${1 + (index % 4)} escalations recorded`,
        score: 4,
      },
      {
        id: `KPI-${index + 1}-3`,
        name: "Collaboration",
        target: "Cross-team satisfaction score of 4.5",
        actual: `${(4.2 + (index % 8) / 10).toFixed(1)} average score`,
        score: 4 + (index % 2),
      },
    ],
    rating: ratings[index % ratings.length],
    strengths:
      index % 2 === 0
        ? "Consistently delivers high-quality work and proactively shares knowledge with teammates."
        : "Strong ownership of priorities and excellent communication with stakeholders.",
    improvements:
      index % 2 === 0
        ? "Continue improving documentation for recurring operational processes."
        : "Delegate more effectively and provide earlier risk visibility.",
    managerComments:
      "Solid performance for the period. Recommended for continued growth opportunities.",
    status: statuses[index % statuses.length],
    submittedAt:
      statuses[index % statuses.length] === "draft"
        ? null
        : mockTimestamp(-20 + index, 15),
  }));

export const performanceGoalSeed: PerformanceGoal[] = employeeSeed
  .filter((employee) => employee.employmentStatus === "active")
  .slice(0, 10)
  .map((employee, index) => ({
    id: `GOAL-${String(index + 1).padStart(3, "0")}`,
    employeeId: employee.id,
    title: [
      "Improve monthly reporting turnaround",
      "Complete HRIS advanced training",
      "Reduce support response time",
      "Launch customer onboarding playbook",
    ][index % 4],
    description:
      "Deliver measurable improvements aligned with the employee's quarterly objectives.",
    dueDate: mockDate(30 + index * 5),
    progress: 20 + ((index * 13) % 70),
    status: index % 4 === 0 ? "completed" : index % 3 === 0 ? "at_risk" : "on_track",
  }));
