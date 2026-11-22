import type {
  Application,
  Candidate,
  Interview,
  JobOpening,
  RecruitmentStage,
} from "@/types/recruitment";
import { avatarColor, mockDate, mockTimestamp } from "./_common";

export const jobOpeningSeed: JobOpening[] = [
  {
    id: "JOB-001",
    title: "Senior Full-Stack Engineer",
    departmentId: "DEPT-001",
    positionId: "POS-002",
    location: "Pasig City / Hybrid",
    employmentType: "Full-time",
    salaryMin: 110000,
    salaryMax: 150000,
    status: "open",
    postedAt: mockDate(-28),
    description: "Own end-to-end delivery of customer-facing product features.",
  },
  {
    id: "JOB-002",
    title: "People Operations Specialist",
    departmentId: "DEPT-002",
    positionId: "POS-006",
    location: "Pasig City",
    employmentType: "Full-time",
    salaryMin: 55000,
    salaryMax: 75000,
    status: "open",
    postedAt: mockDate(-21),
    description: "Support employee lifecycle operations and HR service delivery.",
  },
  {
    id: "JOB-003",
    title: "Enterprise Account Executive",
    departmentId: "DEPT-004",
    positionId: "POS-011",
    location: "Makati City",
    employmentType: "Full-time",
    salaryMin: 70000,
    salaryMax: 110000,
    status: "open",
    postedAt: mockDate(-18),
    description: "Grow enterprise accounts across Luzon and Visayas.",
  },
  {
    id: "JOB-004",
    title: "Customer Support Lead",
    departmentId: "DEPT-006",
    positionId: "POS-014",
    location: "Cebu City",
    employmentType: "Full-time",
    salaryMin: 80000,
    salaryMax: 120000,
    status: "on_hold",
    postedAt: mockDate(-40),
    description: "Lead a distributed support team and improve SLA performance.",
  },
];

const candidateProfiles: Array<[string, string, string, number]> = [
  ["Jordan", "Mendoza", "jordan.mendoza@example.com", 7],
  ["Ana", "Khatib", "ana.khatib@example.com", 5],
  ["Timothy", "Chua", "timothy.chua@example.com", 9],
  ["Michelle", "Ferrer", "michelle.ferrer@example.com", 4],
  ["Rafael", "Santos", "rafael.santos@example.com", 6],
  ["Rina", "Ibarra", "rina.ibarra@example.com", 3],
  ["Dennis", "Villareal", "dennis.villareal@example.com", 8],
  ["Sarah", "Octaviano", "sarah.octaviano@example.com", 5],
  ["Paul", "Dela Cruz", "paul.delacruz@example.com", 2],
  ["Katrina", "Sison", "katrina.sison@example.com", 6],
];

export const candidateSeed: Candidate[] = candidateProfiles.map((profile, index) => ({
  id: `CAND-${String(index + 1).padStart(3, "0")}`,
  firstName: profile[0],
  lastName: profile[1],
  email: profile[2],
  contactNumber: `0919 888 ${String(1000 + index).padStart(4, "0")}`,
  location: index % 2 === 0 ? "Quezon City" : "Cebu City",
  resumeName: `${profile[0]}_${profile[1]}_Resume.pdf`,
  yearsOfExperience: profile[3],
  appliedAt: mockDate(-25 + index * 2),
  avatarColor: avatarColor(index + 2),
}));

const stages: RecruitmentStage[] = [
  "applied",
  "screening",
  "interview",
  "assessment",
  "offered",
  "hired",
  "rejected",
  "screening",
  "interview",
  "applied",
];

export const applicationSeed: Application[] = candidateSeed.map((candidate, index) => ({
  id: `APP-${String(index + 1).padStart(3, "0")}`,
  jobId: jobOpeningSeed[index % jobOpeningSeed.length].id,
  candidateId: candidate.id,
  stage: stages[index],
  rating: index % 4 === 0 ? null : 3 + (index % 3),
  notes:
    stages[index] === "hired"
      ? "Accepted offer; onboarding scheduled"
      : stages[index] === "rejected"
        ? "Did not meet the required experience level"
        : "Candidate progressing through the hiring pipeline",
  updatedAt: mockTimestamp(-10 + index, 11),
}));

export const interviewSeed: Interview[] = applicationSeed
  .filter((application) => application.stage === "interview" || application.stage === "assessment")
  .map((application, index) => ({
    id: `INT-${String(index + 1).padStart(3, "0")}`,
    applicationId: application.id,
    scheduledAt: mockTimestamp(2 + index, 10 + (index % 3)),
    interviewerId: index % 2 === 0 ? "EMP-005" : "EMP-001",
    mode: index % 2 === 0 ? "Video call" : "Onsite",
    status: "scheduled",
  }));
