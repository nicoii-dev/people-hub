import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function CompanyWorkspaceLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="h-28 animate-pulse rounded-xl bg-muted" />
      <LoadingSkeleton variant="cards" count={3} />
    </div>
  );
}
