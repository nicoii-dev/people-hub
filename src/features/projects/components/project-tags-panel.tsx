"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useCreateProjectTag,
  useDeleteProjectTag,
} from "@/hooks/use-projects";
import type { Project } from "@/types/project";

interface ProjectTagsPanelProps {
  project: Project;
  canEdit: boolean;
}

export function ProjectTagsPanel({ project, canEdit }: ProjectTagsPanelProps) {
  const [name, setName] = React.useState("");
  const [color, setColor] = React.useState("#2563EB");
  const createMutation = useCreateProjectTag();
  const deleteMutation = useDeleteProjectTag();

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createMutation.mutateAsync({
        projectId: project.id,
        input: { name: trimmed, color },
      });
      setName("");
      toast.success("Tag added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The tag could not be added.");
    }
  }

  async function handleRemove(tagId: string) {
    try {
      await deleteMutation.mutateAsync({ projectId: project.id, tagId });
      toast.success("Tag removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The tag could not be removed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tags</CardTitle>
        <CardDescription>Project-specific labels used for filtering and reporting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.tags.length === 0 ? (
          <EmptyState title="No tags yet" description="Add a label to organise this project." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: tag.color ?? "#94A3B8" }}
                  aria-hidden="true"
                />
                {tag.name}
                {canEdit ? (
                  <button
                    type="button"
                    onClick={() => void handleRemove(tag.id)}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${tag.name} tag`}
                  >
                    <Trash2 className="size-3" />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        )}

        {canEdit ? (
          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New tag name"
              aria-label="New tag name"
              className="sm:max-w-xs"
            />
            <Input
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              aria-label="Tag color"
              className="w-14 shrink-0 p-1"
            />
            <Button onClick={() => void handleAdd()} disabled={!name.trim() || createMutation.isPending}>
              <Plus />
              Add tag
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
