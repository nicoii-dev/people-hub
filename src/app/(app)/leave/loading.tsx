import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function LeaveLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
