import { Suspense } from "react";
import type { Metadata } from "next";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { BillingView } from "@/features/billing/billing-view";

// The app shell gates children behind client-side auth hydration, so this
// segment cannot render during instant-navigation validation.
export const instant = false;

export const metadata: Metadata = {
  title: "Billing & Subscription",
};

export default function BillingPage() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="cards" count={4} />}>
      <BillingView />
    </Suspense>
  );
}
