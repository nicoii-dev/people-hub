import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function ProjectsLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
