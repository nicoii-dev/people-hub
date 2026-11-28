import type { Metadata } from "next";
import { PlatformSettingsView } from "@/features/platform/platform-settings-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Platform Settings",
};

export default function PlatformSettingsPage() {
  return <PlatformSettingsView />;
}
