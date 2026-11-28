"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Power, PowerOff, SquareKanban } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { usePermission } from "@/features/auth/hooks";
import { useClient, useUpdateClientStatus } from "@/hooks/use-clients";
import { useProjects } from "@/hooks/use-projects";
import { formatDate } from "@/lib/utils";
import type { Client, ClientStatus } from "@/types/client";
import { ClientFormDialog } from "./components/client-form-dialog";

interface ClientDetailViewProps {
  clientId: string;
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const canEdit = usePermission("clients:edit");
  const clientQuery = useClient(clientId);
  const projectsQuery = useProjects({ clientId, limit: 100 });
  const statusMutation = useUpdateClientStatus();

  if (clientQuery.isPending) {
    return (
      <div className="space-y-6">
        <PageHeader title="Client details" description="Loading client record…" />
        <LoadingSkeleton variant="detail" />
      </div>
    );
  }

  if (clientQuery.isError || !clientQuery.data) {
    const message = clientQuery.error instanceof Error ? clientQuery.error.message : "";
    if (message.toLowerCase().includes("not found")) {
      return (
        <EmptyState
          title="Client not found"
          description="This client record does not exist or was removed."
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

    return (
      <ErrorState
        title="Client unavailable"
        description="The client record could not be loaded."
        error={clientQuery.error}
        onRetry={() => void clientQuery.refetch()}
      />
    );
  }

  const client: Client = clientQuery.data.data;
  const nextStatus: ClientStatus = client.status === "active" ? "inactive" : "active";

  async function handleStatus() {
    try {
      await statusMutation.mutateAsync({ id: clientId, status: nextStatus });
      toast.success(`Client ${nextStatus === "active" ? "activated" : "deactivated"}`);
      setStatusOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The request could not be completed.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={`Client record · ${client.code}`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/clients">
                <ArrowLeft />
                Back
              </Link>
            </Button>
            {canEdit ? (
              <Button variant="outline" onClick={() => setStatusOpen(true)}>
                {client.status === "active" ? <PowerOff /> : <Power />}
                {client.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            ) : null}
            {canEdit ? (
              <Button onClick={() => setEditOpen(true)}>
                <Pencil />
                Edit client
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Client information</CardTitle>
            <CardDescription>Account identity and classification.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Client name" value={client.name} />
            <Detail label="Company name" value={client.companyName} />
            <Detail label="Code" value={<Badge variant="secondary">{client.code}</Badge>} />
            <Detail label="Industry" value={client.industry} />
            <Detail label="Status" value={<StatusBadge status={client.status} />} />
            <Detail label="Projects" value={client.projectCount} />
            <div className="sm:col-span-2">
              <Detail label="Description / notes" value={client.description} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & address</CardTitle>
            <CardDescription>Primary contact details for this account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Contact person" value={client.contactName} />
            <Detail label="Email" value={client.email} />
            <Detail label="Phone" value={client.phone} />
            <div className="sm:col-span-2">
              <Detail label="Address" value={client.address} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>{client.projectCount} project(s) linked to this client.</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsQuery.isPending ? (
              <LoadingSkeleton variant="table" count={3} />
            ) : projectsQuery.isError ? (
              <ErrorState
                title="Projects unavailable"
                description="The linked projects could not be loaded."
                error={projectsQuery.error}
                onRetry={() => void projectsQuery.refetch()}
              />
            ) : (projectsQuery.data?.data.items.length ?? 0) === 0 ? (
              <EmptyState
                icon={<SquareKanban className="size-5" />}
                title="No projects listed yet"
                description="Create a project for this client to start tracking delivery."
              />
            ) : (
              <div className="divide-y rounded-md border">
                {projectsQuery.data?.data.items.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex flex-col gap-2 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project.code} · {project.startDate ? formatDate(project.startDate) : "No start date"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={project.status} />
                      <StatusBadge status={project.priority} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record metadata</CardTitle>
            <CardDescription>Audit information for this client.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Client ID" value={<span className="font-mono text-xs">{client.id}</span>} />
            <Detail label="Created" value={formatDate(client.createdAt)} />
            <Detail label="Updated" value={formatDate(client.updatedAt)} />
            <Detail
              label="Deleted"
              value={client.deletedAt ? formatDate(client.deletedAt) : "—"}
            />
          </CardContent>
        </Card>
      </div>

      <ClientFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
      />

      <ConfirmDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        title={client.status === "active" ? "Deactivate client?" : "Activate client?"}
        description={
          client.status === "active"
            ? "The client will not be able to receive new projects. Existing records stay accessible."
            : "The client will be available for new projects again."
        }
        confirmLabel={client.status === "active" ? "Deactivate" : "Activate"}
        destructive={client.status === "active"}
        loading={statusMutation.isPending}
        onConfirm={() => void handleStatus()}
      />
    </div>
  );
}
