import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function PerformanceLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
