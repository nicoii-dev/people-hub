import { companyProfileSeed, systemUserSeed } from "@/data/settings";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type {
  CompanyProfile,
  SystemUser,
  SystemUserUpdateInput,
} from "@/types/settings";
import {
  MOCK_COLLECTIONS,
  MOCK_VALUES,
  mockDelay,
  readCollection,
  readValue,
  writeCollection,
  writeValue,
} from "./mock/persistence";

export interface SettingsService {
  getCompanyProfile(): ServiceResult<CompanyProfile>;
  updateCompanyProfile(input: CompanyProfile): ServiceResult<CompanyProfile>;
  listUsers(): ServiceResult<SystemUser[]>;
  updateUser(id: string, input: SystemUserUpdateInput): ServiceResult<SystemUser>;
}

const mockSettingsService: SettingsService = {
  async getCompanyProfile() {
    await mockDelay(80);
    return success(
      readValue(MOCK_VALUES.companyProfile, companyProfileSeed),
      "Company profile retrieved successfully",
    );
  },

  async updateCompanyProfile(input) {
    await mockDelay(160);
    writeValue(MOCK_VALUES.companyProfile, input);
    return success(input, "Company profile updated successfully");
  },

  async listUsers() {
    await mockDelay(90);
    return success(
      readCollection(MOCK_COLLECTIONS.users, systemUserSeed),
      "System users retrieved successfully",
    );
  },

  async updateUser(id, input) {
    await mockDelay(140);
    const users = readCollection(MOCK_COLLECTIONS.users, systemUserSeed);
    const index = users.findIndex((user) => user.id === id);
    if (index < 0) throw new Error("System user not found");
    const updated: SystemUser = { ...users[index], ...input };
    const next = [...users];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.users, next);
    return success(updated, "System user updated successfully");
  },
};

// Settings UI still uses local data; the API exposes company settings and
// members under different shapes, so it will be wired separately.
export const settingsService: SettingsService = mockSettingsService;
