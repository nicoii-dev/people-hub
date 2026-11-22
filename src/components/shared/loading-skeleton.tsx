import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type SkeletonVariant = "cards" | "table" | "detail";

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = "cards", count = 4, className }: LoadingSkeletonProps) {
  if (variant === "table") {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: count }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
