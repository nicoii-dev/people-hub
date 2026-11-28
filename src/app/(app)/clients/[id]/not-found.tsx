import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function ClientNotFound() {
  return (
    <EmptyState
      title="Client not found"
      description="The requested client record does not exist."
      action={
        <Button asChild variant="outline">
          <Link href="/clients">
            <ArrowLeft />
            Back to clients
          </Link>
        </Button>
      }
    />
  );
}
