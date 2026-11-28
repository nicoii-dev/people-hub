import type { Metadata } from "next";
import { PlatformOverviewView } from "@/features/platform/platform-overview-view";

// The app shell gates children behind client-side auth hydration, so this
// segment cannot render during instant-navigation validation.
export const instant = false;

export const metadata: Metadata = {
  title: "Platform Overview",
};

export default function PlatformPage() {
  return <PlatformOverviewView />;
}
