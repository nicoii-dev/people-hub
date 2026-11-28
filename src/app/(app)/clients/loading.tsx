import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function ClientsLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
