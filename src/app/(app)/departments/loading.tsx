import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function DepartmentsLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
