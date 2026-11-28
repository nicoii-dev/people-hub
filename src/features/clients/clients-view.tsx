"use client";

import * as React from "react";
import {
  Building2,
  CheckCircle2,
  PauseCircle,
  Plus,
  SearchX,
  SquareKanban,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatCard } from "@/components/shared/stat-card";
import { usePermission } from "@/features/auth/hooks";
import {
  useClients,
  useDeleteClient,
  useUpdateClientStatus,
} from "@/hooks/use-clients";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Client, ClientStatus } from "@/types/client";
import { ClientFormDialog } from "./components/client-form-dialog";
import { ClientTable } from "./components/client-table";

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

const EMPTY_CLIENTS: Client[] = [];

export function ClientsView() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ClientStatus | "">("");
  const [formOpen, setFormOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Client | null>(null);
  const [statusTarget, setStatusTarget] = React.useState<Client | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);
  const canAdd = usePermission("clients:create");
  const canEdit = usePermission("clients:edit");
  const canDelete = usePermission("clients:delete");
  const params = React.useMemo(
    () => ({ search: debouncedSearch, status: statusFilter, limit: 100 }),
    [debouncedSearch, statusFilter],
  );
  const clientsQuery = useClients(params);
  const deleteMutation = useDeleteClient();
  const statusMutation = useUpdateClientStatus();

  const allClients = clientsQuery.data?.data.items ?? EMPTY_CLIENTS;
  const activeCount = allClients.filter((client) => client.status === "active").length;
  const inactiveCount = allClients.filter((client) => client.status === "inactive").length;
  const projectCount = allClients.reduce((sum, client) => sum + client.projectCount, 0);

  function openCreate() {
    setSelectedClient(null);
    setFormOpen(true);
  }

  function openEdit(client: Client) {
    setSelectedClient(client);
    setFormOpen(true);
  }

  async function handleStatus() {
    if (!statusTarget) return;
    const nextStatus: ClientStatus = statusTarget.status === "active" ? "inactive" : "active";
    try {
      await statusMutation.mutateAsync({ id: statusTarget.id, status: nextStatus });
      toast.success(`Client ${nextStatus === "active" ? "activated" : "deactivated"}`);
      setStatusTarget(null);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Client deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Keep track of client accounts, contacts, and their projects."
        actions={
          canAdd ? (
            <Button onClick={openCreate}>
              <Plus />
              Add client
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Clients"
          value={allClients.length}
          icon={Building2}
          description="Registered client accounts"
          loading={clientsQuery.isPending}
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={CheckCircle2}
          description="Currently active clients"
          loading={clientsQuery.isPending}
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          icon={PauseCircle}
          description="Retained for historical records"
          loading={clientsQuery.isPending}
        />
        <StatCard
          title="Projects"
          value={projectCount}
          icon={SquareKanban}
          description="Projects across clients"
          loading={clientsQuery.isPending}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search clients…"
            className="w-full sm:max-w-sm"
          />
          <FilterDropdown
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ClientStatus | "")}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
            placeholder="Filter by status"
            className="sm:ml-auto"
          />
        </div>

        {clientsQuery.isError ? (
          <div className="p-4">
            <ErrorState
              title="Clients unavailable"
              description="The client list could not be loaded."
              error={clientsQuery.error}
              onRetry={() => void clientsQuery.refetch()}
            />
          </div>
        ) : clientsQuery.isPending ? (
          <div className="p-4">
            <LoadingSkeleton variant="table" count={8} />
          </div>
        ) : allClients.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<SearchX className="size-5" />}
              title={search || statusFilter ? "No matching clients" : "No clients yet"}
              description={
                search || statusFilter
                  ? "Try a different search term or status."
                  : "Add a client to start tracking accounts."
              }
              action={
                !search && !statusFilter && canAdd ? (
                  <Button onClick={openCreate}>
                    <Plus />
                    Add client
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <ClientTable
            clients={allClients}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={openEdit}
            onStatus={setStatusTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </Card>

      <ClientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        client={selectedClient}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(null);
        }}
        title={statusTarget?.status === "active" ? "Deactivate client?" : "Activate client?"}
        description={
          statusTarget
            ? statusTarget.status === "active"
              ? `${statusTarget.name} will not be able to receive new projects. Existing records stay accessible.`
              : `${statusTarget.name} will be available for new projects again.`
            : ""
        }
        confirmLabel={statusTarget?.status === "active" ? "Deactivate" : "Activate"}
        destructive={statusTarget?.status === "active"}
        loading={statusMutation.isPending}
        onConfirm={() => void handleStatus()}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete client?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be removed from the active client list. Historical records are preserved.`
            : ""
        }
        confirmLabel="Delete"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
