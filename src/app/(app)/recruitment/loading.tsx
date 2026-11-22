import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function RecruitmentLoading() {
  return <LoadingSkeleton variant="table" count={8} />;
}
