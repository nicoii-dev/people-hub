import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function EmployeeNotFound() {
  return (
    <EmptyState
      title="Employee not found"
      description="The requested employee record does not exist."
      action={
        <Button asChild variant="outline">
          <Link href="/employees">
            <ArrowLeft />
            Back to directory
          </Link>
        </Button>
      }
    />
  );
}
