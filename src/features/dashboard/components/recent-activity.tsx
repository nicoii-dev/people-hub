import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Target,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { ActivityItem } from "@/types/dashboard";

interface RecentActivityProps {
  items: ActivityItem[];
}

const ICONS: Record<ActivityItem["kind"], LucideIcon> = {
  hire: UserPlus,
  leave: CalendarDays,
  attendance: CheckCircle2,
  payroll: ClipboardList,
  performance: Target,
};

export function RecentActivity({ items }: RecentActivityProps) {
  if (!items.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <div key={item.id} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.action}</p>
              <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {item.occurredAt.slice(0, 10)} · {item.occurredAt.slice(11, 16)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
