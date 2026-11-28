import { env } from "@/config/env";
import { mockTimestamp, mockUuid } from "@/data/_common";
import { clientSeed } from "@/data/clients";
import { projectSeed } from "@/data/projects";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { ApiSuccess, ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  Client,
  ClientCreateInput,
  ClientStatus,
  ClientUpdateInput,
} from "@/types/client";
import {
  asRecord,
  fromClientInput,
  mapPage,
  toClient,
  toClientQuery,
  type BackendRecord,
} from "./api/adapters";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface ClientService {
  list(params?: ListParams): ServiceResult<Paginated<Client>>;
  getById(id: string): ServiceResult<Client>;
  create(input: ClientCreateInput): ServiceResult<Client>;
  update(id: string, input: ClientUpdateInput): ServiceResult<Client>;
  setStatus(id: string, status: ClientStatus): ServiceResult<Client>;
  remove(id: string): ServiceResult<{ id: string }>;
}

function loadClients() {
  return readCollection(MOCK_COLLECTIONS.clients, clientSeed);
}

function activeClients() {
  return loadClients().filter((client) => !client.deletedAt);
}

function assertUnique(clients: Client[], input: ClientCreateInput, ignoreId?: string) {
  const name = input.name.trim().toLowerCase();
  const code = input.code.trim().toLowerCase();
  const duplicate = clients.some(
    (client) =>
      client.id !== ignoreId &&
      (client.name.toLowerCase() === name || client.code.toLowerCase() === code),
  );
  if (duplicate) throw new Error("A client with this name or code already exists");
}

function normalizeCreate(input: ClientCreateInput): Omit<Client, "id" | "createdAt" | "updatedAt" | "deletedAt"> {
  return {
    name: input.name,
    companyName: input.companyName ?? "",
    code: input.code,
    contactName: input.contactName ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    address: input.address ?? "",
    industry: input.industry ?? "",
    description: input.description ?? "",
    status: input.status,
    projectCount: 0,
  };
}

const mockClientService: ClientService = {
  async list(params = {}) {
    await mockDelay(90);
    const status = typeof params.status === "string" ? params.status.toLowerCase() : "";
    const clients = activeClients().filter(
      (client) => !status || client.status === status,
    );
    return paginate(clients, { ...params, limit: params.limit ?? 50 }, "Clients retrieved successfully");
  },

  async getById(id) {
    await mockDelay(60);
    return success(
      assertFound(
        activeClients().find((item) => item.id === id),
        "Client",
      ),
      "Client retrieved successfully",
    );
  },

  async create(input) {
    await mockDelay(140);
    const clients = loadClients();
    assertUnique(clients, input);
    const timestamp = mockTimestamp(0);
    const client: Client = {
      ...normalizeCreate(input),
      id: mockUuid(),
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
    };
    writeCollection(MOCK_COLLECTIONS.clients, [...clients, client]);
    return success(client, "Client created successfully");
  },

  async update(id, input) {
    await mockDelay(140);
    const clients = loadClients();
    const index = clients.findIndex((item) => item.id === id && !item.deletedAt);
    if (index < 0) throw new Error("Client not found");
    const merged: ClientCreateInput = {
      name: input.name ?? clients[index].name,
      code: input.code ?? clients[index].code,
      companyName: input.companyName ?? clients[index].companyName,
      contactName: input.contactName ?? clients[index].contactName,
      email: input.email ?? clients[index].email,
      phone: input.phone ?? clients[index].phone,
      address: input.address ?? clients[index].address,
      industry: input.industry ?? clients[index].industry,
      description: input.description ?? clients[index].description,
      status: input.status ?? clients[index].status,
    };
    assertUnique(clients, merged, id);
    const updated: Client = {
      ...clients[index],
      ...normalizeCreate(merged),
      id,
      updatedAt: mockTimestamp(0),
    };
    const next = [...clients];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.clients, next);
    return success(updated, "Client updated successfully");
  },

  async setStatus(id, status) {
    await mockDelay(100);
    const clients = loadClients();
    const index = clients.findIndex((item) => item.id === id && !item.deletedAt);
    if (index < 0) throw new Error("Client not found");
    const updated: Client = {
      ...clients[index],
      status,
      updatedAt: mockTimestamp(0),
    };
    const next = [...clients];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.clients, next);
    return success(updated, "Client status updated successfully");
  },

  async remove(id) {
    await mockDelay(140);
    const clients = loadClients();
    if (!clients.some((item) => item.id === id && !item.deletedAt)) {
      throw new Error("Client not found");
    }
    const projects = readCollection(MOCK_COLLECTIONS.projects, projectSeed);
    if (projects.some((project) => project.clientId === id && !project.deletedAt)) {
      throw new Error("Cannot delete a client with active projects");
    }
    const timestamp = mockTimestamp(0);
    writeCollection(
      MOCK_COLLECTIONS.clients,
      clients.map((item) =>
        item.id === id ? { ...item, deletedAt: timestamp, updatedAt: timestamp } : item,
      ),
    );
    return success({ id }, "Client deleted successfully");
  },
};

const apiClientService: ClientService = {
  list: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(API_ENDPOINTS.clients(), toClientQuery(params))
      .then((response) => mapPage(response, toClient)),
  getById: (id) =>
    apiClient
      .get<BackendRecord>(API_ENDPOINTS.client(id))
      .then((response) => ({ ...response, data: toClient(response.data) })),
  create: (input) =>
    apiClient
      .post<BackendRecord>(API_ENDPOINTS.clients(), fromClientInput(input))
      .then((response) => ({ ...response, data: toClient(response.data) })),
  update: (id, input) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.client(id), fromClientInput(input))
      .then((response) => ({ ...response, data: toClient(response.data) })),
  setStatus: (id, status) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.clientStatus(id), { status: status.toUpperCase() })
      .then((response) => ({ ...response, data: toClient(response.data) })),
  remove: (id) =>
    apiClient
      .delete<BackendRecord>(API_ENDPOINTS.client(id))
      .then((response) => ({
        ...response,
        data: { id: String(asRecord(response.data).id ?? id) },
      })),
};

export const clientService: ClientService = env.useMockData
  ? mockClientService
  : apiClientService;

export type ClientListResponse = ApiSuccess<Paginated<Client>>;
