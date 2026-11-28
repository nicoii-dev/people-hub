"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function ClientsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Clients unavailable"
      description="The clients page could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
