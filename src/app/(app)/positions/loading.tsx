import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function PositionsLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
