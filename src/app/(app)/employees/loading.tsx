import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function EmployeesLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
