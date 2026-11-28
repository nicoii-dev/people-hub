import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function TimeEntriesLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
