import type { Metadata } from "next";
import { PlatformUsageView } from "@/features/platform/platform-usage-view";

export const instant = false;

export const metadata: Metadata = {
  title: "System Usage",
};

export default function PlatformUsagePage() {
  return <PlatformUsageView />;
}
