import Link from "next/link";
import { MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/types/client";

interface ClientTableProps {
  clients: Client[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (client: Client) => void;
  onStatus: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientTable({
  clients,
  canEdit,
  canDelete,
  onEdit,
  onStatus,
  onDelete,
}: ClientTableProps) {
  const columns: DataTableColumn<Client>[] = [
    {
      id: "client",
      header: "Client",
      cellClassName: "min-w-56",
      cell: (client) => (
        <div className="space-y-1">
          <Link href={`/clients/${client.id}`} className="text-sm font-medium hover:underline">
            {client.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {client.companyName || client.industry || "—"}
          </p>
        </div>
      ),
    },
    {
      id: "code",
      header: "Code",
      cell: (client) => <Badge variant="secondary">{client.code}</Badge>,
    },
    {
      id: "projects",
      header: "Projects",
      cell: (client) => <span className="text-sm tabular-nums">{client.projectCount}</span>,
    },
    {
      id: "contact",
      header: "Contact",
      cellClassName: "min-w-48",
      cell: (client) => (
        <div className="space-y-1">
          <p className="text-sm">{client.contactName || "—"}</p>
          <p className="text-xs text-muted-foreground">{client.email || "—"}</p>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (client) => <span className="text-xs text-muted-foreground">{client.phone || "—"}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (client) => <StatusBadge status={client.status} />,
    },
    {
      id: "created",
      header: "Added",
      cell: (client) => (
        <span className="text-xs text-muted-foreground">{formatDate(client.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      cell: (client) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canEdit && !canDelete}
              aria-label={`Actions for ${client.name}`}
            >
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage client</DropdownMenuLabel>
            {canEdit ? (
              <DropdownMenuItem onSelect={() => onEdit(client)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {canEdit ? (
              <DropdownMenuItem onSelect={() => onStatus(client)}>
                {client.status === "active" ? <PowerOff /> : <Power />}
                {client.status === "active" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
            ) : null}
            {canEdit && canDelete ? <DropdownMenuSeparator /> : null}
            {canDelete ? (
              <DropdownMenuItem
                onSelect={() => onDelete(client)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return <DataTable columns={columns} data={clients} getRowId={(client) => client.id} />;
}
