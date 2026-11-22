import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: string; positive: boolean };
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              {trend ? (
                <span
                  className={cn(
                    "mb-1 text-xs font-medium",
                    trend.positive ? "text-emerald-600" : "text-red-600",
                  )}
                >
                  {trend.positive ? "+" : ""}
                  {trend.value}
                </span>
              ) : null}
            </div>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
