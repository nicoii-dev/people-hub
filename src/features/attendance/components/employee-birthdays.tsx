"use client";

import { Cake, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { useUpcomingBirthdays } from "@/hooks/use-birthdays";
import type { Birthday } from "@/types/birthday";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function displayName(birthday: Birthday) {
  return birthday.preferredName || `${birthday.firstName} ${birthday.lastName}`;
}

function BirthdayRow({ birthday }: { birthday: Birthday }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2.5">
      <EmployeeAvatar
        firstName={birthday.firstName}
        lastName={birthday.lastName}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{displayName(birthday)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {birthday.department || birthday.position || birthday.employeeNumber}
        </p>
      </div>
      <Badge variant="secondary" className="shrink-0">
        {MONTHS[birthday.month - 1]} {birthday.day}
      </Badge>
    </div>
  );
}

export function EmployeeBirthdays() {
  const {
    birthdaysToday,
    comingBirthdays,
    isPending,
    isError,
    error,
    refetch,
  } = useUpcomingBirthdays();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Cake className="size-5 text-primary" />
            Birthdays
          </CardTitle>
          <CardDescription>Who is celebrating today and soon.</CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Refresh birthdays"
          disabled={isPending}
          onClick={() => void refetch()}
        >
          <RefreshCw className={isPending ? "size-4 animate-spin" : "size-4"} />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Birthdays today</p>
            <Badge variant={birthdaysToday.length ? "default" : "secondary"}>
              {birthdaysToday.length}
            </Badge>
          </div>
          {isPending ? (
            <p className="text-sm text-muted-foreground">Loading birthdays…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load birthdays"}
            </p>
          ) : birthdaysToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">No birthdays today.</p>
          ) : (
            <div className="space-y-2">
              {birthdaysToday.map((birthday) => (
                <BirthdayRow key={birthday.employeeId} birthday={birthday} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Coming birthdays</p>
            <Badge variant="secondary">{comingBirthdays.length}</Badge>
          </div>
          {isPending ? (
            <p className="text-sm text-muted-foreground">Loading birthdays…</p>
          ) : comingBirthdays.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming birthdays in the next two months.
            </p>
          ) : (
            <div className="space-y-2">
              {comingBirthdays.map((birthday) => (
                <BirthdayRow key={birthday.employeeId} birthday={birthday} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
