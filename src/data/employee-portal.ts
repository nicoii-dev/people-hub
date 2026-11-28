import type {
  Announcement,
  CompanyPolicy,
  HandbookSection,
  OnboardingTask,
} from "@/types/employee-portal";
import { mockDate, mockTimestamp } from "./_common";

export const announcementSeed: Announcement[] = [
  {
    id: "ANN-001",
    title: "November All-Hands: product roadmap preview",
    summary:
      "Join the leadership team for a live walkthrough of the Q4 roadmap and an open Q&A session.",
    category: "events",
    author: "PeopleHub Leadership",
    publishedAt: mockTimestamp(-2, 9),
    pinned: true,
  },
  {
    id: "ANN-002",
    title: "Updated hybrid work guidelines",
    summary:
      "The revised policy clarifies anchor days, remote-work requests, and coordination expectations for each team.",
    category: "policy",
    author: "Human Resources",
    publishedAt: mockTimestamp(-5, 14),
  },
  {
    id: "ANN-003",
    title: "Welcome our new Customer Success teammates",
    summary:
      "Say hello to Beatrice Lim, Mikaela Ramos, and Analyn Cordero, who joined the team this month.",
    category: "people",
    author: "People Operations",
    publishedAt: mockTimestamp(-8, 11),
  },
  {
    id: "ANN-004",
    title: "Learning stipend applications are open",
    summary:
      "Employees may now request support for conferences, certifications, and job-relevant courses for the semester.",
    category: "company",
    author: "Learning & Development",
    publishedAt: mockTimestamp(-12, 16),
  },
];

export const onboardingTaskSeed: OnboardingTask[] = [
  {
    id: "ONB-001",
    title: "Complete your employee profile",
    description:
      "Confirm your personal details, emergency contact, and government identifiers in the HR system.",
    status: "completed",
    dueDate: mockDate(-18),
    completedAt: mockTimestamp(-19, 10),
  },
  {
    id: "ONB-002",
    title: "Upload employment documents",
    description:
      "Submit your signed contract, resume, and any required government IDs for records verification.",
    status: "completed",
    dueDate: mockDate(-15),
    completedAt: mockTimestamp(-16, 15),
  },
  {
    id: "ONB-003",
    title: "Finish information security training",
    description:
      "Complete the data privacy and security awareness course assigned to all new hires.",
    status: "completed",
    dueDate: mockDate(-10),
    completedAt: mockTimestamp(-11, 13),
  },
  {
    id: "ONB-004",
    title: "Meet your onboarding buddy",
    description:
      "Schedule an introductory session with your buddy and review your first-week checklist.",
    status: "completed",
    dueDate: mockDate(-7),
    completedAt: mockTimestamp(-7, 11),
  },
  {
    id: "ONB-005",
    title: "Review the employee handbook",
    description:
      "Read the company handbook and acknowledge the policies in the employee portal.",
    status: "in_progress",
    dueDate: mockDate(3),
  },
  {
    id: "ONB-006",
    title: "Set up your time-tracking routine",
    description:
      "Clock in and out from the Team Directory and confirm your location and photo capture settings.",
    status: "pending",
    dueDate: mockDate(7),
  },
];

export const companyPolicySeed: CompanyPolicy[] = [
  {
    id: "POL-001",
    title: "Hybrid Work Policy",
    category: "Work arrangement",
    summary:
      "Guidelines for anchor days, remote work eligibility, and team coordination.",
    details: [
      "Teams set two anchor days each week for in-person collaboration.",
      "Remote work requests are submitted through the HR portal at least one week in advance.",
      "Employees are expected to maintain a secure, distraction-free work environment.",
    ],
    updatedAt: mockDate(-24),
  },
  {
    id: "POL-002",
    title: "Leave and Time Off",
    category: "Benefits",
    summary:
      "Vacation, sick leave, and special leave entitlements with request procedures.",
    details: [
      "Vacation leave requests should be filed at least three working days ahead when planned.",
      "Sick leave may be reported on the day of absence with a brief medical note when required.",
      "Unused balances and carry-over rules are confirmed at the start of each calendar year.",
    ],
    updatedAt: mockDate(-31),
  },
  {
    id: "POL-003",
    title: "Code of Conduct",
    category: "Workplace",
    summary:
      "Standards for professionalism, respectful interaction, and conflict resolution.",
    details: [
      "Treat colleagues, clients, and partners with respect and courtesy.",
      "Disclose potential conflicts of interest to your manager or Human Resources.",
      "Report concerns through the proper channel; retaliation is not tolerated.",
    ],
    updatedAt: mockDate(-45),
  },
  {
    id: "POL-004",
    title: "Data Privacy and Security",
    category: "Compliance",
    summary:
      "Rules for handling personal data, company devices, and access credentials.",
    details: [
      "Use company-approved storage and sharing tools for work-related information.",
      "Never share account credentials or leave unattended devices unlocked.",
      "Report suspected data incidents to Security immediately.",
    ],
    updatedAt: mockDate(-18),
  },
];

export const handbookSeed: HandbookSection[] = [
  {
    id: "HB-001",
    title: "Getting started",
    summary: "Your first week, workplace basics, and who to ask for help.",
    topics: ["First-week checklist", "Office and remote setup", "Buddy program"],
  },
  {
    id: "HB-002",
    title: "Working at PeopleHub",
    summary: "How teams collaborate, communicate, and make decisions.",
    topics: ["Communication norms", "Meeting practices", "Cross-team workflows"],
  },
  {
    id: "HB-003",
    title: "Growth and learning",
    summary: "Performance conversations, learning support, and career paths.",
    topics: ["Goal setting", "Learning stipend", "Internal mobility"],
  },
  {
    id: "HB-004",
    title: "Pay, benefits, and support",
    summary: "Payroll timing, statutory benefits, and employee assistance.",
    topics: ["Payroll schedule", "Health benefits", "Employee assistance program"],
  },
];
