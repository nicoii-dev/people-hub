import { env } from "@/config/env";
import { employeeSeed } from "@/data/employees";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type { Birthday, BirthdayList } from "@/types/birthday";
import { toBirthdayList, type BackendRecord } from "./api/adapters";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import { mockDelay } from "./mock/persistence";

export interface BirthdayService {
  list(month?: number): ServiceResult<BirthdayList>;
}

function monthName(month: number) {
  return new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(2000, month - 1, 1),
  );
}

const mockBirthdayService: BirthdayService = {
  async list(month = new Date().getMonth() + 1) {
    await mockDelay(60);
    const birthdays: Birthday[] = employeeSeed
      .filter((employee) => Number(employee.dateOfBirth.slice(5, 7)) === month)
      .map((employee) => {
        const dateOfBirth = employee.dateOfBirth;
        return {
          employeeId: employee.id,
          employeeNumber: employee.employeeNumber,
          firstName: employee.firstName,
          lastName: employee.lastName,
          preferredName: null,
          email: employee.email,
          dateOfBirth,
          month,
          day: Number(dateOfBirth.slice(8, 10)),
          department: null,
          position: null,
        };
      })
      .sort((a, b) => a.day - b.day || a.lastName.localeCompare(b.lastName));

    return success(
      {
        month,
        monthName: monthName(month),
        count: birthdays.length,
        birthdays,
      },
      "Birthdays retrieved",
    );
  },
};

const apiBirthdayService: BirthdayService = {
  list: (month) =>
    apiClient
      .get<BackendRecord>(API_ENDPOINTS.birthdays(), month ? { month } : undefined)
      .then((response) => ({
        ...response,
        data: toBirthdayList(response.data),
      })),
};

export const birthdayService: BirthdayService = env.useMockData
  ? mockBirthdayService
  : apiBirthdayService;
