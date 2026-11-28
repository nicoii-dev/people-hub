"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Projects unavailable"
      description="The projects page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
