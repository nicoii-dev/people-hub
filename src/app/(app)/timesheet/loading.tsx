import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function TimesheetLoading() {
  return <LoadingSkeleton variant="table" count={7} />;
}
