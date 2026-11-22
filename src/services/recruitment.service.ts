import { env } from "@/config/env";
import {
  applicationSeed,
  candidateSeed,
  interviewSeed,
  jobOpeningSeed,
} from "@/data/recruitment";
import { paginate } from "@/lib/pagination";
import { success } from "@/lib/result";
import type { ListParams, Paginated, ServiceResult } from "@/types/api";
import type {
  Application,
  ApplicationQueryParams,
  Candidate,
  Interview,
  JobOpening,
  RecruitmentStage,
} from "@/types/recruitment";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface RecruitmentService {
  listJobs(): ServiceResult<JobOpening[]>;
  listCandidates(params?: ListParams): ServiceResult<Paginated<Candidate>>;
  listApplications(params?: ApplicationQueryParams): ServiceResult<Paginated<Application>>;
  moveCandidate(applicationId: string, stage: RecruitmentStage): ServiceResult<Application>;
  listInterviews(): ServiceResult<Interview[]>;
  scheduleInterview(applicationId: string, scheduledAt: string, interviewerId: string): ServiceResult<Interview>;
}

function loadApplications() {
  return readCollection(MOCK_COLLECTIONS.applications, applicationSeed);
}

const mockRecruitmentService: RecruitmentService = {
  async listJobs() {
    await mockDelay(70);
    return success(readCollection(MOCK_COLLECTIONS.jobs, jobOpeningSeed), "Job openings retrieved successfully");
  },

  async listCandidates(params = {}) {
    await mockDelay(80);
    return paginate(readCollection(MOCK_COLLECTIONS.candidates, candidateSeed), { ...params, limit: params.limit ?? 50 }, "Candidates retrieved successfully");
  },

  async listApplications(params = {}) {
    await mockDelay(90);
    const filtered = loadApplications().filter((application) => {
      if (params.jobId && application.jobId !== params.jobId) return false;
      if (params.stage && application.stage !== params.stage) return false;
      return true;
    });
    return paginate(filtered, { ...params, limit: params.limit ?? 100 }, "Applications retrieved successfully");
  },

  async moveCandidate(applicationId, stage) {
    await mockDelay(140);
    const applications = loadApplications();
    const index = applications.findIndex((application) => application.id === applicationId);
    if (index < 0) throw new Error("Application not found");
    const updated = { ...applications[index], stage, updatedAt: "2026-11-22T11:00:00" };
    const next = [...applications];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.applications, next);
    return success(updated, "Candidate stage updated successfully");
  },

  async listInterviews() {
    await mockDelay(70);
    return success(readCollection(MOCK_COLLECTIONS.interviews, interviewSeed), "Interviews retrieved successfully");
  },

  async scheduleInterview(applicationId, scheduledAt, interviewerId) {
    await mockDelay(140);
    const interviews = readCollection(MOCK_COLLECTIONS.interviews, interviewSeed);
    const nextNumber = Math.max(0, ...interviews.map((item) => Number(item.id.replace("INT-", "")))) + 1;
    const interview: Interview = {
      id: `INT-${String(nextNumber).padStart(3, "0")}`,
      applicationId,
      scheduledAt,
      interviewerId,
      mode: "Video call",
      status: "scheduled",
    };
    writeCollection(MOCK_COLLECTIONS.interviews, [...interviews, interview]);
    return success(interview, "Interview scheduled successfully");
  },
};

const apiRecruitmentService: RecruitmentService = {
  listJobs: () => apiClient.get<JobOpening[]>(API_ENDPOINTS.jobs),
  listCandidates: (params) => apiClient.get<Paginated<Candidate>>(API_ENDPOINTS.candidates, params),
  listApplications: (params) => apiClient.get<Paginated<Application>>(API_ENDPOINTS.applications, params),
  moveCandidate: (id, stage) => apiClient.patch<Application>(`${API_ENDPOINTS.applications}/${id}/stage`, { stage }),
  listInterviews: () => apiClient.get<Interview[]>(API_ENDPOINTS.interviews),
  scheduleInterview: (applicationId, scheduledAt, interviewerId) =>
    apiClient.post<Interview>(API_ENDPOINTS.interviews, { applicationId, scheduledAt, interviewerId }),
};

export const recruitmentService: RecruitmentService = env.useMockData
  ? mockRecruitmentService
  : apiRecruitmentService;
