import type {
  CivilStatus,
  Employee,
  EmployeeStatus,
  Gender,
} from "@/types/employee";
import {
  avatarColor,
  DEGREE_PROGRAMS,
  mockDate,
  PHILIPPINE_ADDRESSES,
  SKILL_POOL,
  UNIVERSITIES,
} from "./_common";
import { positionSeed } from "./positions";

interface EmployeeProfile {
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
  positionId: string;
  hiredDaysAgo: number;
  status: EmployeeStatus;
  workLocation: string;
}

const profiles: EmployeeProfile[] = [
  { firstName: "Amara", middleName: "L.", lastName: "Reyes", gender: "Female", positionId: "POS-003", hiredDaysAgo: 1860, status: "active", workLocation: "Pasig City" },
  { firstName: "Kenji", middleName: "M.", lastName: "Nakamura", gender: "Male", positionId: "POS-002", hiredDaysAgo: 1420, status: "active", workLocation: "Pasig City" },
  { firstName: "Priya", middleName: "S.", lastName: "Gupta", gender: "Female", positionId: "POS-001", hiredDaysAgo: 980, status: "active", workLocation: "Remote" },
  { firstName: "Noel", middleName: "R.", lastName: "Castro", gender: "Male", positionId: "POS-004", hiredDaysAgo: 740, status: "active", workLocation: "Pasig City" },
  { firstName: "Josefa", middleName: "T.", lastName: "Torres", gender: "Female", positionId: "POS-005", hiredDaysAgo: 1740, status: "active", workLocation: "Pasig City" },
  { firstName: "Mariel", middleName: "A.", lastName: "David", gender: "Female", positionId: "POS-006", hiredDaysAgo: 1120, status: "active", workLocation: "Pasig City" },
  { firstName: "Janry", middleName: "P.", lastName: "Mercado", gender: "Male", positionId: "POS-007", hiredDaysAgo: 210, status: "active", workLocation: "Remote" },
  { firstName: "Beatrice", middleName: "C.", lastName: "Lim", gender: "Female", positionId: "POS-006", hiredDaysAgo: 65, status: "active", workLocation: "Pasig City" },
  { firstName: "Ricardo", middleName: "D.", lastName: "Mendoza", gender: "Male", positionId: "POS-008", hiredDaysAgo: 1690, status: "active", workLocation: "Pasig City" },
  { firstName: "Shaira", middleName: "B.", lastName: "Cruz", gender: "Female", positionId: "POS-009", hiredDaysAgo: 890, status: "active", workLocation: "Pasig City" },
  { firstName: "Earl", middleName: "V.", lastName: "Domingo", gender: "Male", positionId: "POS-009", hiredDaysAgo: 420, status: "on_leave", workLocation: "Remote" },
  { firstName: "Antonio", middleName: "J.", lastName: "Bautista", gender: "Male", positionId: "POS-010", hiredDaysAgo: 1580, status: "active", workLocation: "Makati City" },
  { firstName: "Karen", middleName: "L.", lastName: "Villanueva", gender: "Female", positionId: "POS-011", hiredDaysAgo: 630, status: "active", workLocation: "Makati City" },
  { firstName: "Paolo", middleName: "E.", lastName: "Ferrer", gender: "Male", positionId: "POS-011", hiredDaysAgo: 310, status: "active", workLocation: "Cebu City" },
  { firstName: "Camille", middleName: "R.", lastName: "Serrano", gender: "Female", positionId: "POS-012", hiredDaysAgo: 1510, status: "active", workLocation: "Makati City" },
  { firstName: "Lance", middleName: "O.", lastName: "Aquino", gender: "Male", positionId: "POS-013", hiredDaysAgo: 520, status: "active", workLocation: "Remote" },
  { firstName: "Mikaela", middleName: "F.", lastName: "Ramos", gender: "Female", positionId: "POS-013", hiredDaysAgo: 95, status: "active", workLocation: "Makati City" },
  { firstName: "Lea", middleName: "S.", lastName: "Francisco", gender: "Female", positionId: "POS-014", hiredDaysAgo: 1370, status: "active", workLocation: "Cebu City" },
  { firstName: "Jomar", middleName: "T.", lastName: "Ocampo", gender: "Male", positionId: "POS-015", hiredDaysAgo: 260, status: "active", workLocation: "Cebu City" },
  { firstName: "Analyn", middleName: "V.", lastName: "Cordero", gender: "Female", positionId: "POS-015", hiredDaysAgo: 14, status: "active", workLocation: "Cebu City" },
  { firstName: "Miguel", middleName: "A.", lastName: "Santos", gender: "Male", positionId: "POS-016", hiredDaysAgo: 1620, status: "active", workLocation: "Pasig City" },
  { firstName: "Rowena", middleName: "E.", lastName: "Palmera", gender: "Female", positionId: "POS-017", hiredDaysAgo: 380, status: "inactive", workLocation: "Pasig City" },
  { firstName: "Patricia", middleName: "L.", lastName: "Lim", gender: "Female", positionId: "POS-018", hiredDaysAgo: 1550, status: "active", workLocation: "Pasig City" },
  { firstName: "Nico", middleName: "H.", lastName: "Manalo", gender: "Male", positionId: "POS-019", hiredDaysAgo: 3, status: "active", workLocation: "Pasig City" },
];

const supervisorByDepartment: Record<string, string> = {
  "DEPT-001": "EMP-001",
  "DEPT-002": "EMP-005",
  "DEPT-003": "EMP-009",
  "DEPT-004": "EMP-013",
  "DEPT-005": "EMP-016",
  "DEPT-006": "EMP-019",
  "DEPT-007": "EMP-021",
  "DEPT-008": "EMP-023",
};

const civilStatuses: CivilStatus[] = ["Single", "Married", "Single", "Married", "Divorced"];
const emergencyNames = [
  "Rosario Reyes",
  "Emilio Nakamura",
  "Luz Gupta",
  "Tereso Castro",
  "Amelia Torres",
  "Danilo David",
  "Fe Mercado",
  "Ruben Lim",
];

function pad(value: number, length: number) {
  return String(value).padStart(length, "0");
}

export const employeeSeed: Employee[] = profiles.map((profile, index) => {
  const position = positionSeed.find((item) => item.id === profile.positionId);
  if (!position) {
    throw new Error(`Missing position seed for ${profile.positionId}`);
  }

  const id = `EMP-${pad(index + 1, 3)}`;
  const birthYear = 1986 + (index % 13);
  const birthMonth = pad((index % 12) + 1, 2);
  const birthDay = pad(5 + (index % 20), 2);
  const emailName = `${profile.firstName}.${profile.lastName}`
    .toLowerCase()
    .replace(/[^a-z.]/g, "");

  return {
    id,
    employeeNumber: `PH-${2020 + (index % 6)}-${pad(index + 1, 3)}`,
    firstName: profile.firstName,
    middleName: profile.middleName,
    lastName: profile.lastName,
    dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
    gender: profile.gender,
    civilStatus: civilStatuses[index % civilStatuses.length],
    nationality: "Filipino",
    contactNumber: `0917 234 ${pad(1000 + index, 4)}`,
    email: `${emailName}@peoplehub.ph`,
    address: PHILIPPINE_ADDRESSES[index % PHILIPPINE_ADDRESSES.length],
    emergencyContact: {
      name: emergencyNames[index % emergencyNames.length],
      relationship: index % 2 === 0 ? "Parent" : "Spouse",
      contactNumber: `0918 555 ${pad(2000 + index, 4)}`,
    },
    employmentType: index % 7 === 0 ? "Contract" : "Full-time",
    departmentId: position.departmentId,
    positionId: position.id,
    supervisorId: profile.positionId === "POS-003" ||
      profile.positionId === "POS-005" ||
      profile.positionId === "POS-008" ||
      profile.positionId === "POS-010" ||
      profile.positionId === "POS-012" ||
      profile.positionId === "POS-014" ||
      profile.positionId === "POS-016" ||
      profile.positionId === "POS-018"
      ? null
      : supervisorByDepartment[position.departmentId],
    dateHired: mockDate(-profile.hiredDaysAgo),
    employmentStatus: profile.status,
    workLocation: profile.workLocation,
    salaryGrade: position.salaryGrade,
    education: [
      {
        id: `EDU-${id}-1`,
        school: UNIVERSITIES[index % UNIVERSITIES.length],
        degree: DEGREE_PROGRAMS[index % DEGREE_PROGRAMS.length],
        yearGraduated: birthYear + 22,
      },
      {
        id: `EDU-${id}-2`,
        school: UNIVERSITIES[(index + 3) % UNIVERSITIES.length],
        degree: "Professional Certification",
        yearGraduated: birthYear + 26,
      },
    ],
    skills: [
      SKILL_POOL[index % SKILL_POOL.length],
      SKILL_POOL[(index + 5) % SKILL_POOL.length],
      SKILL_POOL[(index + 9) % SKILL_POOL.length],
    ],
    governmentIds: {
      sss: `12-${pad(3456789 + index, 7)}-${pad(index + 1, 2)}`,
      philhealth: `01-${pad(2345678 + index, 9)}`,
      pagibig: `1002-${pad(4567890 + index, 7)}-${pad(index + 1, 2)}`,
      tin: `${pad(123 + index, 3)}-${pad(456 + index, 3)}-${pad(789 + index, 3)}`,
    },
    documents: [
      {
        id: `DOC-${id}-1`,
        name: "Employment Contract.pdf",
        type: "Contract",
        uploadedAt: mockDate(-profile.hiredDaysAgo + 2),
        sizeKb: 240 + index * 3,
      },
      {
        id: `DOC-${id}-2`,
        name: "Updated Resume.pdf",
        type: "Resume",
        uploadedAt: mockDate(-Math.max(30, profile.hiredDaysAgo - 20)),
        sizeKb: 180 + index * 2,
      },
    ],
    avatarColor: avatarColor(index),
  };
});
