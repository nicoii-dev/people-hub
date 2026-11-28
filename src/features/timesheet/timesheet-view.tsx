"use client";

import * as React from "react";
import Link from "next/link";
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { CalendarDays, Camera, ChevronLeft, ChevronRight, Clock, Plus, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { useAuth, usePermission } from "@/features/auth/hooks";
import { useAttendance } from "@/hooks/use-attendance";
import { useTimeEntries } from "@/hooks/use-time-entries";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/types/attendance";
import { formatDuration } from "@/types/time-entry";
import { TimeEntryFormDialog } from "@/features/time-entries/components/time-entry-form-dialog";

function minutesFrom(value: string | null): number | null {
  if (!value) return null;
  if (/^\d{2}:\d{2}$/.test(value)) {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours() * 60 + date.getMinutes();
}

function workedMinutes(record: AttendanceRecord): number {
  const start = minutesFrom(record.timeIn);
  const end = minutesFrom(record.timeOut);
  if (start === null || end === null) return 0;
  const span = end >= start ? end - start : end - start + 24 * 60;
  return Math.max(0, span - record.breakMinutes);
}

function formatMinutes(minutes: number) {
  if (!minutes) return "0h";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

const STATUS_LABELS: Record<AttendanceRecord["status"], string> = {
  present: "Present",
  late: "Late",
  absent: "Absent",
  half_day: "Half day",
  on_leave: "On leave",
  overtime: "Overtime",
};

export function TimesheetView() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "";
  const [weekStart, setWeekStart] = React.useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const from = format(weekStart, "yyyy-MM-dd");
  const to = format(weekEnd, "yyyy-MM-dd");

  const query = useAttendance({
    employeeId: employeeId || "__none__",
    from,
    to,
    limit: 50,
    sort: "date",
    order: "asc",
  });
  const canLogTime = usePermission("time-entries:create");
  const [timeFormOpen, setTimeFormOpen] = React.useState(false);
  const timeEntriesQuery = useTimeEntries({
    employeeId: employeeId || "__none__",
    from,
    to,
    limit: 50,
    sort: "workDate",
    order: "asc",
  });

  const records = query.data?.data.items ?? [];
  const byDate = new Map(
    records.map((record) => [format(parseISO(record.date), "yyyy-MM-dd"), record]),
  );
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const totalMinutes = records.reduce((sum, record) => sum + workedMinutes(record), 0);
  const daysPresent = records.filter((record) => record.timeIn).length;
  const lateDays = records.filter((record) => record.status === "late").length;
  const projectEntries = timeEntriesQuery.data?.data.items ?? [];
  const projectMinutes = projectEntries.reduce(
    (sum, entry) => sum + entry.durationMinutes,
    0,
  );
  const billableMinutes = projectEntries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheet"
        description="Your daily time records and worked hours for the selected week."
      />

      {!employeeId ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            No employee profile is linked to your account, so the timesheet is
            unavailable.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-5 text-primary" />
              Week of {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
            </CardTitle>
            <CardDescription>Monday to Sunday time-in and time-out history.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart((current) => addWeeks(current, -1))}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              This week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart((current) => addWeeks(current, 1))}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard
              title="Hours worked"
              value={formatMinutes(totalMinutes)}
              icon={Clock}
              loading={query.isPending}
            />
            <StatCard
              title="Days clocked in"
              value={daysPresent}
              icon={CalendarDays}
              loading={query.isPending}
            />
            <StatCard
              title="Late days"
              value={lateDays}
              icon={Clock}
              loading={query.isPending}
            />
          </div>

          {query.isError ? (
            <ErrorState
              title="Timesheet unavailable"
              description="Your time records could not be loaded."
              error={query.error}
              onRetry={() => void query.refetch()}
            />
          ) : query.isPending ? (
            <LoadingSkeleton variant="table" count={7} />
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time in</TableHead>
                    <TableHead>Time out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {days.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const record = byDate.get(key);
                    const minutes = record ? workedMinutes(record) : 0;
                    return (
                      <TableRow key={key} className={cn(!record && "text-muted-foreground")}>
                        <TableCell className="font-medium">
                          {format(day, "EEE, MMM d")}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            {record?.timeIn ?? "—"}
                            {record?.hasTimeInPhoto ? (
                              <Camera className="size-3.5 text-muted-foreground" aria-label="Time-in photo" />
                            ) : null}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            {record?.timeOut ?? "—"}
                            {record?.hasTimeOutPhoto ? (
                              <Camera className="size-3.5 text-muted-foreground" aria-label="Time-out photo" />
                            ) : null}
                          </span>
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {record?.timeIn ? formatMinutes(minutes) : "—"}
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {record?.timeInLocation || record?.workLocation || "—"}
                        </TableCell>
                        <TableCell>
                          {record ? (
                            <Badge
                              variant={
                                record.status === "absent" || record.status === "late"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {STATUS_LABELS[record.status]}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No record</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Timer className="size-5 text-primary" />
              Project time
            </CardTitle>
            <CardDescription>
              Project work logged this week · {formatMinutes(projectMinutes)} total ·{" "}
              {formatMinutes(billableMinutes)} billable
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/time-entries">All time entries</Link>
            </Button>
            {canLogTime && employeeId ? (
              <Button size="sm" onClick={() => setTimeFormOpen(true)}>
                <Plus />
                Log time
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {timeEntriesQuery.isError ? (
            <ErrorState
              title="Project time unavailable"
              description="Your project time entries could not be loaded."
              error={timeEntriesQuery.error}
              onRetry={() => void timeEntriesQuery.refetch()}
            />
          ) : timeEntriesQuery.isPending ? (
            <LoadingSkeleton variant="table" count={5} />
          ) : projectEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No project time logged this week. Use “Log time” to add an entry.
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {projectEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                >
                  <div className="min-w-0 space-y-0.5">
                    <Link
                      href={`/projects/${entry.projectId}`}
                      className="font-medium hover:underline"
                    >
                      {entry.projectName ?? "Unknown project"}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {format(parseISO(entry.workDate), "EEE, MMM d")}
                      {entry.description ? ` · ${entry.description}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.billable ? "success" : "secondary"}>
                      {entry.billable ? "Billable" : "Non-billable"}
                    </Badge>
                    <span className="font-medium tabular-nums">
                      {formatDuration(entry.durationMinutes)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <TimeEntryFormDialog
        open={timeFormOpen}
        onOpenChange={setTimeFormOpen}
        forcedEmployeeId={employeeId || undefined}
      />
    </div>
  );
}
