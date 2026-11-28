import type { Metadata } from "next";
import { PlatformCompaniesView } from "@/features/platform/platform-companies-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Manage Companies",
};

export default function PlatformCompaniesPage() {
  return <PlatformCompaniesView />;
}
