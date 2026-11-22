import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsNav } from "@/features/settings/settings-nav";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage workspace configuration, company details, and access."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
