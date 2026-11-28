import type { Metadata } from "next";
import { PlatformPlansView } from "@/features/platform/platform-plans-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Subscription Plans",
};

export default function PlatformPlansPage() {
  return <PlatformPlansView />;
}
