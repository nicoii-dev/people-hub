import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function EmployeeLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <LoadingSkeleton variant="cards" count={4} />
    </div>
  );
}
