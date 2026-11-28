import type { Metadata } from "next";
import { CompanyWorkspaceView } from "@/features/platform/company-workspace-view";

export const instant = false;

export const metadata: Metadata = {
  title: "Company workspace",
};

export default async function CompanyWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CompanyWorkspaceView companyId={id} />;
}
