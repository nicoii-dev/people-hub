"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
}

function readMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return null;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this section. Try again in a moment.",
  error,
  onRetry,
}: ErrorStateProps) {
  const message = readMessage(error);

  return (
    <EmptyState
      icon={<AlertTriangle className="size-5" />}
      title={title}
      description={message ? `${description} ${message}` : description}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw />
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}
