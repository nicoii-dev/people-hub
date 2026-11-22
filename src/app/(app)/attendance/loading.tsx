import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function AttendanceLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
