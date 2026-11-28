import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/dashboard-view";

// The app shell gates children behind client-side auth hydration, so this
// segment cannot render during instant-navigation validation.
export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardView />;
}
