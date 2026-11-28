import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function CompanyWorkspaceNotFound() {
  return (
    <EmptyState
      title="Company not found"
      description="The requested company workspace does not exist."
      action={
        <Button asChild variant="outline">
          <Link href="/platform/companies">
            <ArrowLeft />
            Back to Manage companies
          </Link>
        </Button>
      }
    />
  );
}
