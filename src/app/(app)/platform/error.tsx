"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Platform administration unavailable"
      description="This platform page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
