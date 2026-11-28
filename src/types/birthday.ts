export interface Birthday {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  email: string | null;
  dateOfBirth: string;
  /** Calendar month (1-12) and day-of-month of the recurring birthday. */
  month: number;
  day: number;
  department: string | null;
  position: string | null;
}

export interface BirthdayList {
  month: number;
  monthName: string;
  count: number;
  birthdays: Birthday[];
}
