import { StatusBadge } from "@/components/shared/status-badge";
import type { PendingApproval } from "@/types/dashboard";

interface PendingApprovalsProps {
  items: PendingApproval[];
}

export function PendingApprovals({ items }: PendingApprovalsProps) {
  if (!items.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nothing awaiting approval.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.label}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              {item.type} · {item.submittedAt.slice(0, 10)}
            </p>
          </div>
          <StatusBadge status="pending" />
        </div>
      ))}
    </div>
  );
}
