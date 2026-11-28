import type { Metadata } from "next";
import { PlatformPaymentsView } from "@/features/platform/platform-payments-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Payments & Revenue",
};

export default function PlatformPaymentsPage() {
  return <PlatformPaymentsView />;
}
