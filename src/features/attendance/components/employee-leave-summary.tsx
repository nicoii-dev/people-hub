"use client";

import { CalendarCheck2, CalendarDays } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { useAuth } from "@/features/auth/hooks";
import { useLeaveBalances } from "@/hooks/use-leaves";
import { cn } from "@/lib/utils";

export function EmployeeLeaveSummary() {
  const { user } = useAuth();
  const employeeId = user?.employeeId ?? "";
  const balancesQuery = useLeaveBalances(employeeId || undefined);
  const balances = balancesQuery.data?.data ?? [];

  const used = balances.reduce((sum, balance) => sum + balance.used, 0);
  const remaining = balances.reduce((sum, balance) => sum + balance.remaining, 0);
  const breakdown = balances
    .filter((balance) => balance.total > 0)
    .sort((a, b) => b.remaining - a.remaining);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          title="Leaves used"
          value={used}
          icon={CalendarCheck2}
          description="Approved leave days this year"
          loading={balancesQuery.isPending}
        />
        <StatCard
          title="Leaves remaining"
          value={remaining}
          icon={CalendarDays}
          description="Available across all leave types"
          loading={balancesQuery.isPending}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leave balance breakdown</CardTitle>
          <CardDescription>Your used and remaining days per leave type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {balancesQuery.isPending ? (
            <p className="text-sm text-muted-foreground">Loading leave balances…</p>
          ) : breakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave balances available.</p>
          ) : (
            breakdown.map((balance) => {
              const percentage =
                balance.total > 0
                  ? Math.min(100, Math.round((balance.used / balance.total) * 100))
                  : 0;
              return (
                <div key={`${balance.employeeId}-${balance.type}`} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{balance.type}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {balance.used} used / {balance.remaining} left
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full bg-primary",
                        balance.remaining === 0 && "bg-destructive",
                        balance.remaining <= 3 && balance.remaining > 0 && "bg-amber-500",
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
