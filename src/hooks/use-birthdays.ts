"use client";

import { useQuery } from "@tanstack/react-query";
import { birthdayService } from "@/services/birthday.service";
import { queryKeys } from "./query-keys";

export function useBirthdays(month: number) {
  return useQuery({
    queryKey: queryKeys.birthdays(month),
    queryFn: () => birthdayService.list(month),
  });
}

/** Combines this month and next month so the list works at year end too. */
export function useUpcomingBirthdays() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const nextMonth = (currentMonth % 12) + 1;
  const today = now.getDate();

  const current = useBirthdays(currentMonth);
  const next = useBirthdays(nextMonth);

  const all = [
    ...(current.data?.data.birthdays ?? []),
    ...(next.data?.data.birthdays ?? []),
  ];
  const birthdaysToday = all.filter(
    (birthday) => birthday.month === currentMonth && birthday.day === today,
  );
  const comingBirthdays = all
    .filter((birthday) =>
      birthday.month === currentMonth
        ? birthday.day > today
        : birthday.month === nextMonth,
    )
    .sort((a, b) => a.month - b.month || a.day - b.day || a.lastName.localeCompare(b.lastName))
    .slice(0, 8);

  return {
    birthdaysToday,
    comingBirthdays,
    isPending: current.isPending || next.isPending,
    isError: current.isError || next.isError,
    error: current.error ?? next.error,
    refetch: async () => {
      await Promise.all([current.refetch(), next.refetch()]);
    },
  };
}
