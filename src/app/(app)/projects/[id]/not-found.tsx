import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function ProjectNotFound() {
  return (
    <EmptyState
      title="Project not found"
      description="The requested project record does not exist."
      action={
        <Button asChild variant="outline">
          <Link href="/projects">
            <ArrowLeft />
            Back to projects
          </Link>
        </Button>
      }
    />
  );
}
