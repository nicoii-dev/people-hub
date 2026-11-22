"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Settings unavailable"
      description="The settings area could not be rendered."
      error={error}
      onRetry={reset}
    />
  );
}
