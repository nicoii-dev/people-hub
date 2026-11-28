"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientService } from "@/services/client.service";
import type { ListParams } from "@/types/api";
import type {
  ClientCreateInput,
  ClientStatus,
  ClientUpdateInput,
} from "@/types/client";
import { queryKeys } from "./query-keys";

export function useClients(params?: ListParams) {
  return useQuery({
    queryKey: queryKeys.clientList(params),
    queryFn: () => clientService.list(params),
  });
}

export function useClient(clientId: string) {
  return useQuery({
    queryKey: queryKeys.client(clientId),
    queryFn: () => clientService.getById(clientId),
    enabled: Boolean(clientId),
  });
}

function useInvalidateClients() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projectReport });
  };
}

export function useCreateClient() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (input: ClientCreateInput) =>
      clientService.create(input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateClient() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClientUpdateInput }) =>
      clientService.update(id, input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateClientStatus() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClientStatus }) =>
      clientService.setStatus(id, status).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useDeleteClient() {
  const invalidate = useInvalidateClients();
  return useMutation({
    mutationFn: (id: string) => clientService.remove(id).then((response) => response.data),
    onSuccess: invalidate,
  });
}
