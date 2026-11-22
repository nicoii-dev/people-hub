import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen overflow-hidden bg-background">
          <div className="hidden w-64 shrink-0 border-r bg-card lg:block" />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <LoadingSkeleton variant="table" count={8} />
            </div>
          </main>
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
