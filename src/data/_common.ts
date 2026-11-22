import { addDays, format, parseISO } from "date-fns";

/** Fixed reference date keeps every mock snapshot deterministic across server/client. */
export const MOCK_TODAY = "2026-11-22";

export function mockDate(daysFromToday: number) {
  return format(addDays(parseISO(MOCK_TODAY), daysFromToday), "yyyy-MM-dd");
}

export function mockTimestamp(daysFromToday: number, hour = 9) {
  return `${mockDate(daysFromToday)}T${String(hour).padStart(2, "0")}:00:00`;
}

export const AVATAR_COLORS = [
  "#2563eb",
  "#059669",
  "#7c3aed",
  "#db2777",
  "#d97706",
  "#0891b2",
  "#4f46e5",
  "#65a30d",
] as const;

export function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export const PHILIPPINE_ADDRESSES = [
  "12 Aurora Blvd, Quezon City, Metro Manila",
  "45 Meralco Ave, Pasig City, Metro Manila",
  "88 Osmeña Blvd, Cebu City, Cebu",
  "7 Sampaguita St, Makati City, Metro Manila",
  "21 Roxas Blvd, Manila City, Metro Manila",
  "14 Magsaysay Ave, Davao City, Davao del Sur",
  "33 Quezon Ave, Iloilo City, Iloilo",
  "9 Mabini St, Taguig City, Metro Manila",
] as const;

export const UNIVERSITIES = [
  "University of the Philippines Diliman",
  "Ateneo de Manila University",
  "De La Salle University",
  "University of Santo Tomas",
  "Mindanao State University",
  "Cebu Normal University",
] as const;

export const DEGREE_PROGRAMS = [
  "BS Computer Science",
  "BS Accountancy",
  "BA Psychology",
  "BS Business Administration",
  "BS Information Technology",
  "BA Communications",
] as const;

export const SKILL_POOL = [
  "TypeScript",
  "React",
  "Node.js",
  "HRIS",
  "Payroll",
  "Recruitment",
  "Excel",
  "QuickBooks",
  "Salesforce",
  "Communication",
  "Project Management",
  "Customer Support",
  "SQL",
  "Figma",
] as const;
