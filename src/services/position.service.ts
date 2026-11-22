import { env } from "@/config/env";
import { positionSeed } from "@/data/positions";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  Position,
  PositionCreateInput,
  PositionUpdateInput,
} from "@/types/position";
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
};

const apiPositionService: PositionService = {
  list: (params) => apiClient.get<Paginated<Position>>(API_ENDPOINTS.positions, params),
  getById: (id) => apiClient.get<Position>(`${API_ENDPOINTS.positions}/${id}`),
  create: (input) => apiClient.post<Position>(API_ENDPOINTS.positions, input),
  update: (id, input) => apiClient.patch<Position>(`${API_ENDPOINTS.positions}/${id}`, input),
};

export const positionService: PositionService = env.useMockData
  ? mockPositionService
  : apiPositionService;
