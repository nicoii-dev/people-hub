"use client";

import {
  Activity,
  Building2,
  Database,
  Gauge,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlatformUsage } from "@/hooks/use-platform";
import { formatDateTime } from "@/lib/utils";

function compact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function PlatformUsageView() {
  const usage = usePlatformUsage();

  if (usage.isError) {
    return (
      <ErrorState
        title="System usage unavailable"
        description="Platform usage metrics could not be loaded."
        error={usage.error}
        onRetry={() => void usage.refetch()}
      />
    );
  }

  if (usage.isPending || !usage.data) {
    return <LoadingSkeleton variant="cards" count={4} />;
  }

  const data = usage.data.data;
  const maxActiveUsers = Math.max(1, ...data.topCompanies.map((company) => company.activeUsers));

  return (
    <div className="space-y-6">
      <PageHeader
        title="System usage"
        description={`Monitor adoption and capacity across all tenants · ${data.period}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Active companies"
          value={data.totals.activeCompanies}
          icon={Building2}
          description={`${data.totals.trialCompanies} trial · ${data.totals.suspendedCompanies} suspended`}
        />
        <StatCard
          title="Active users"
          value={data.totals.activeUsers.toLocaleString()}
          icon={UsersRound}
          description="Logged in during the period"
        />
        <StatCard
          title="API requests"
          value={compact(data.totals.apiRequests)}
          icon={Activity}
          description="Requests in the last 7 days"
        />
        <StatCard
          title="Storage"
          value={`${data.totals.storageGb} GB`}
          icon={Database}
          description="Across all company workspaces"
        />
        <StatCard
          title="Uptime"
          value={`${data.totals.uptimePercent}%`}
          icon={Gauge}
          description="Rolling availability"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Active users
            </CardTitle>
            <CardDescription>Daily active users across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data.trend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  name="Active users"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              API requests
            </CardTitle>
            <CardDescription>Daily request volume served by the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.trend} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(value: number) => compact(value)}
                />
                <Tooltip formatter={(value) => compact(Number(value))} />
                <Bar dataKey="apiRequests" name="Requests" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top companies by usage</CardTitle>
          <CardDescription>
            Snapshot generated {formatDateTime(data.generatedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Active users</TableHead>
                <TableHead>Share</TableHead>
                <TableHead>API requests</TableHead>
                <TableHead>Storage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topCompanies.map((company) => (
                <TableRow key={company.companyId}>
                  <TableCell className="font-medium">{company.companyName}</TableCell>
                  <TableCell>{company.activeUsers.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${Math.round((company.activeUsers / maxActiveUsers) * 100)}%`,
                          }}
                        />
                      </div>
                      <Badge variant="secondary">
                        {Math.round((company.activeUsers / data.totals.activeUsers) * 100)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{compact(company.apiRequests)}</TableCell>
                  <TableCell>{company.storageGb} GB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
