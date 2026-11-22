import { Cake } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BirthdayListProps {
  items: Array<{ employeeId: string; name: string; dateOfBirth: string }>;
}

export function BirthdayList({ items }: BirthdayListProps) {
  if (!items.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No birthdays in the next 30 days.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.employeeId} className="flex items-center gap-3 rounded-lg border p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            <Cake className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(item.dateOfBirth, { month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
