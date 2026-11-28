import { env } from "@/config/env";
import { employeeSeed } from "@/data/employees";
import { positionSeed } from "@/data/positions";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  Position,
  PositionCreateInput,
  PositionUpdateInput,
} from "@/types/position";
import {
  asRecord,
  fromPositionInput,
  mapPage,
  toPosition,
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

export interface PositionService {
  list(params?: ListParams): ServiceResult<Paginated<Position>>;
  getById(id: string): ServiceResult<Position>;
  create(input: PositionCreateInput): ServiceResult<Position>;
  update(id: string, input: PositionUpdateInput): ServiceResult<Position>;
  remove(id: string): ServiceResult<{ id: string }>;
}

function loadPositions() {
  return readCollection(MOCK_COLLECTIONS.positions, positionSeed);
}

const mockPositionService: PositionService = {
  async list(params = {}) {
    await mockDelay(80);
    return paginate(loadPositions(), { ...params, limit: params.limit ?? 50 }, "Positions retrieved successfully");
  },
  async getById(id) {
    await mockDelay(60);
    return success(assertFound(loadPositions().find((item) => item.id === id), "Position"), "Position retrieved successfully");
  },
  async create(input) {
    await mockDelay(140);
    const positions = loadPositions();
    const next = Math.max(0, ...positions.map((item) => Number(item.id.replace("POS-", "")))) + 1;
    const position: Position = { ...input, id: `POS-${String(next).padStart(3, "0")}` };
    writeCollection(MOCK_COLLECTIONS.positions, [...positions, position]);
    return success(position, "Position created successfully");
  },
  async update(id, input) {
    await mockDelay(140);
    const positions = loadPositions();
    const index = positions.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Position not found");
    const updated = { ...positions[index], ...input, id };
    const next = [...positions];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.positions, next);
    return success(updated, "Position updated successfully");
  },
  async remove(id) {
    await mockDelay(140);
    const employees = readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
    if (employees.some((employee) => employee.positionId === id)) {
      throw new Error("Cannot delete a position with assigned employees");
    }
    const next = loadPositions().filter((item) => item.id !== id);
    writeCollection(MOCK_COLLECTIONS.positions, next);
    return success({ id }, "Position deleted successfully");
  },
};

const apiPositionService: PositionService = {
  list: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(API_ENDPOINTS.positions(), params)
      .then((response) => mapPage(response, toPosition)),
  getById: (id) =>
    apiClient
      .get<BackendRecord>(API_ENDPOINTS.position(id))
      .then((response) => ({ ...response, data: toPosition(response.data) })),
  create: (input) =>
    apiClient
      .post<BackendRecord>(API_ENDPOINTS.positions(), fromPositionInput(input))
      .then((response) => ({ ...response, data: toPosition(response.data) })),
  update: (id, input) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.position(id), fromPositionInput(input))
      .then((response) => ({ ...response, data: toPosition(response.data) })),
  remove: (id) =>
    apiClient
      .delete<BackendRecord>(API_ENDPOINTS.position(id))
      .then((response) => ({
        ...response,
        data: { id: String(asRecord(response.data).id ?? id) },
      })),
};

export const positionService: PositionService = env.useMockData
  ? mockPositionService
  : apiPositionService;
