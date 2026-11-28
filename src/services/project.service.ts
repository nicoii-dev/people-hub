import { env } from "@/config/env";
import { mockTimestamp, mockUuid } from "@/data/_common";
import { clientSeed } from "@/data/clients";
import { employeeSeed } from "@/data/employees";
import {
  projectAssignmentSeed,
  projectSeed,
  projectTagSeed,
} from "@/data/projects";
import { paginate } from "@/lib/pagination";
import { assertFound, success } from "@/lib/result";
import type { ApiSuccess, ListParams, Paginated, ServiceResult } from "@/types/api";
import type { Client } from "@/types/client";
import type { Employee } from "@/types/employee";
import type {
  Project,
  ProjectAssignment,
  ProjectAssignmentCreateInput,
  ProjectAssignmentRole,
  ProjectListParams,
  ProjectStatus,
  ProjectTag,
  ProjectTagCreateInput,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "@/types/project";
import { canChangeProjectStatus } from "@/types/project";
import {
  asRecord,
  fromProjectAssignmentInput,
  fromProjectInput,
  fromProjectTagInput,
  mapList,
  mapPage,
  toProject,
  toProjectAssignment,
  toProjectQuery,
  toProjectTag,
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

export interface ProjectService {
  list(params?: ProjectListParams): ServiceResult<Paginated<Project>>;
  getById(id: string): ServiceResult<Project>;
  create(input: ProjectCreateInput): ServiceResult<Project>;
  update(id: string, input: ProjectUpdateInput): ServiceResult<Project>;
  setStatus(id: string, status: ProjectStatus): ServiceResult<Project>;
  remove(id: string): ServiceResult<{ id: string }>;

  listTags(projectId: string): ServiceResult<ProjectTag[]>;
  createTag(projectId: string, input: ProjectTagCreateInput): ServiceResult<ProjectTag>;
  updateTag(
    projectId: string,
    tagId: string,
    input: Partial<ProjectTagCreateInput>,
  ): ServiceResult<ProjectTag>;
  removeTag(projectId: string, tagId: string): ServiceResult<{ id: string }>;

  listAssignments(projectId: string): ServiceResult<ProjectAssignment[]>;
  listCompanyAssignments(
    params?: ListParams,
  ): ServiceResult<Paginated<ProjectAssignment>>;
  assign(
    projectId: string,
    input: ProjectAssignmentCreateInput,
  ): ServiceResult<ProjectAssignment>;
  updateAssignment(
    projectId: string,
    assignmentId: string,
    input: { role: ProjectAssignmentRole },
  ): ServiceResult<ProjectAssignment>;
  unassign(projectId: string, assignmentId: string): ServiceResult<{ id: string }>;
}

/* -------------------------------------------------------------------------- */
/* Mock implementation                                                         */
/* -------------------------------------------------------------------------- */

function loadProjects() {
  return readCollection(MOCK_COLLECTIONS.projects, projectSeed);
}

function loadTags() {
  return readCollection(MOCK_COLLECTIONS.projectTags, projectTagSeed);
}

function loadAssignments() {
  return readCollection(MOCK_COLLECTIONS.projectAssignments, projectAssignmentSeed);
}

function loadClients() {
  return readCollection(MOCK_COLLECTIONS.clients, clientSeed);
}

function loadEmployees() {
  return readCollection(MOCK_COLLECTIONS.employees, employeeSeed);
}

function activeProjects() {
  return loadProjects().filter((project) => !project.deletedAt);
}

function findActiveProject(id: string): Project {
  return assertFound(
    activeProjects().find((project) => project.id === id),
    "Project",
  );
}

function findActiveClient(id: string): Client {
  const client = loadClients().find(
    (item) => item.id === id && !item.deletedAt && item.status === "active",
  );
  if (!client) throw new Error("Client must be active to receive projects");
  return client;
}

function assertUniqueCode(projects: Project[], code: string, ignoreId?: string) {
  const normalized = code.trim().toLowerCase();
  if (
    projects.some(
      (project) =>
        project.id !== ignoreId &&
        !project.deletedAt &&
        project.code.toLowerCase() === normalized,
    )
  ) {
    throw new Error("Project code is already in use");
  }
}

function assertDateRange(start: string, end: string) {
  if (start && end && new Date(end) < new Date(start)) {
    throw new Error("End date cannot be before the start date");
  }
}

function hydrate(project: Project, tags: ProjectTag[], assignments: ProjectAssignment[]): Project {
  return {
    ...project,
    tags: tags.filter((tag) => tag.projectId === project.id),
    assignments: assignments.filter((item) => item.projectId === project.id),
  };
}

function assertProjectTag(projectId: string, tagId: string): ProjectTag {
  return assertFound(
    loadTags().find((tag) => tag.id === tagId && tag.projectId === projectId),
    "Project tag",
  );
}

function assertAssignment(projectId: string, assignmentId: string): ProjectAssignment {
  return assertFound(
    loadAssignments().find(
      (item) => item.id === assignmentId && item.projectId === projectId,
    ),
    "Project assignment",
  );
}

const mockProjectService: ProjectService = {
  async list(params = {}) {
    await mockDelay(90);
    const status = typeof params.status === "string" ? params.status.toLowerCase() : "";
    const priority = typeof params.priority === "string" ? params.priority.toLowerCase() : "";
    const tags = loadTags();
    const assignments = loadAssignments();
    const projects = activeProjects().filter(
      (project) =>
        (!status || project.status === status) &&
        (!priority || project.priority === priority) &&
        (!params.clientId || project.clientId === params.clientId),
    );
    return paginate(
      projects.map((project) => hydrate(project, tags, assignments)),
      { ...params, limit: params.limit ?? 50 },
      "Projects retrieved successfully",
    );
  },

  async getById(id) {
    await mockDelay(60);
    return success(
      hydrate(findActiveProject(id), loadTags(), loadAssignments()),
      "Project retrieved successfully",
    );
  },

  async create(input) {
    await mockDelay(140);
    const projects = loadProjects();
    assertUniqueCode(projects, input.code);
    const client = findActiveClient(input.clientId);
    assertDateRange(input.startDate ?? "", input.endDate ?? "");
    const timestamp = mockTimestamp(0);
    const project: Project = {
      id: mockUuid(),
      clientId: client.id,
      clientName: client.name,
      clientCode: client.code,
      name: input.name,
      code: input.code,
      description: input.description ?? "",
      status: input.status ?? "planning",
      priority: input.priority ?? "medium",
      startDate: input.startDate ?? "",
      endDate: input.endDate ?? "",
      budget: input.budget ?? null,
      billable: input.billable ?? true,
      createdById: "user-admin",
      createdByName: "Hector Administrator",
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null,
      tags: [],
      assignments: [],
    };
    writeCollection(MOCK_COLLECTIONS.projects, [...projects, project]);
    return success(project, "Project created successfully");
  },

  async update(id, input) {
    await mockDelay(140);
    const projects = loadProjects();
    const index = projects.findIndex((item) => item.id === id && !item.deletedAt);
    if (index < 0) throw new Error("Project not found");
    const current = projects[index];
    const clientId = input.clientId ?? current.clientId;
    const client = clientId === current.clientId ? null : findActiveClient(clientId);
    const startDate = input.startDate ?? current.startDate;
    const endDate = input.endDate ?? current.endDate;
    assertDateRange(startDate, endDate);
    assertUniqueCode(projects, input.code ?? current.code, id);
    const updated: Project = {
      ...current,
      ...input,
      clientId,
      clientName: client?.name ?? current.clientName,
      clientCode: client?.code ?? current.clientCode,
      startDate,
      endDate,
      description: input.description ?? current.description,
      budget: input.budget === undefined ? current.budget : input.budget,
      billable: input.billable ?? current.billable,
      updatedAt: mockTimestamp(0),
    };
    const next = [...projects];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.projects, next);
    return success(
      hydrate(updated, loadTags(), loadAssignments()),
      "Project updated successfully",
    );
  },

  async setStatus(id, status) {
    await mockDelay(100);
    const projects = loadProjects();
    const index = projects.findIndex((item) => item.id === id && !item.deletedAt);
    if (index < 0) throw new Error("Project not found");
    const current = projects[index];
    if (!canChangeProjectStatus(current.status, status)) {
      throw new Error(`Cannot change project status from ${current.status} to ${status}`);
    }
    const updated: Project = {
      ...current,
      status,
      updatedAt: mockTimestamp(0),
    };
    const next = [...projects];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.projects, next);
    return success(
      hydrate(updated, loadTags(), loadAssignments()),
      "Project status updated successfully",
    );
  },

  async remove(id) {
    await mockDelay(140);
    const projects = loadProjects();
    if (!projects.some((item) => item.id === id && !item.deletedAt)) {
      throw new Error("Project not found");
    }
    const timestamp = mockTimestamp(0);
    writeCollection(
      MOCK_COLLECTIONS.projects,
      projects.map((item) =>
        item.id === id ? { ...item, deletedAt: timestamp, updatedAt: timestamp } : item,
      ),
    );
    return success({ id }, "Project deleted successfully");
  },

  async listTags(projectId) {
    await mockDelay(60);
    findActiveProject(projectId);
    return success(
      loadTags()
        .filter((tag) => tag.projectId === projectId)
        .sort((a, b) => a.name.localeCompare(b.name)),
      "Project tags retrieved successfully",
    );
  },

  async createTag(projectId, input) {
    await mockDelay(100);
    findActiveProject(projectId);
    const tags = loadTags();
    const name = input.name.trim();
    if (
      tags.some(
        (tag) =>
          tag.projectId === projectId && tag.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new Error("A tag with this name already exists on this project");
    }
    const timestamp = mockTimestamp(0);
    const tag: ProjectTag = {
      id: mockUuid(),
      projectId,
      name,
      color: input.color ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    writeCollection(MOCK_COLLECTIONS.projectTags, [...tags, tag]);
    return success(tag, "Project tag created successfully");
  },

  async updateTag(projectId, tagId, input) {
    await mockDelay(100);
    const tags = loadTags();
    const index = tags.findIndex(
      (tag) => tag.id === tagId && tag.projectId === projectId,
    );
    if (index < 0) throw new Error("Project tag not found");
    const name = (input.name ?? tags[index].name).trim();
    if (
      tags.some(
        (tag) =>
          tag.id !== tagId &&
          tag.projectId === projectId &&
          tag.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new Error("A tag with this name already exists on this project");
    }
    const updated: ProjectTag = {
      ...tags[index],
      name,
      color: input.color === undefined ? tags[index].color : input.color,
      updatedAt: mockTimestamp(0),
    };
    const next = [...tags];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.projectTags, next);
    return success(updated, "Project tag updated successfully");
  },

  async removeTag(projectId, tagId) {
    await mockDelay(100);
    assertProjectTag(projectId, tagId);
    writeCollection(
      MOCK_COLLECTIONS.projectTags,
      loadTags().filter((tag) => tag.id !== tagId),
    );
    return success({ id: tagId }, "Project tag deleted successfully");
  },

  async listAssignments(projectId) {
    await mockDelay(60);
    findActiveProject(projectId);
    const project = findActiveProject(projectId);
    return success(
      loadAssignments()
        .filter((item) => item.projectId === projectId)
        .map((item) => ({ ...item, projectName: project.name, projectCode: project.code })),
      "Project assignments retrieved successfully",
    );
  },

  async listCompanyAssignments(params = {}) {
    await mockDelay(60);
    return paginate(
      loadAssignments(),
      { ...params, limit: params.limit ?? 50 },
      "Project assignments retrieved successfully",
    );
  },

  async assign(projectId, input) {
    await mockDelay(120);
    const project = findActiveProject(projectId);
    const employee: Employee = assertFound(
      loadEmployees().find(
        (item) => item.id === input.employeeId && item.employmentStatus === "active",
      ),
      "Active employee",
    );
    const assignments = loadAssignments();
    if (
      assignments.some(
        (item) => item.projectId === projectId && item.employeeId === input.employeeId,
      )
    ) {
      throw new Error("This employee is already assigned to the project");
    }
    const timestamp = mockTimestamp(0);
    const assignment: ProjectAssignment = {
      id: mockUuid(),
      projectId,
      projectName: project.name,
      projectCode: project.code,
      employeeId: employee.id,
      employeeNumber: employee.employeeNumber,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      role: input.role ?? "member",
      assignedById: "user-admin",
      assignedByName: "Hector Administrator",
      assignedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    writeCollection(MOCK_COLLECTIONS.projectAssignments, [...assignments, assignment]);
    return success(assignment, "Employee assigned to project successfully");
  },

  async updateAssignment(projectId, assignmentId, input) {
    await mockDelay(120);
    const assignments = loadAssignments();
    const index = assignments.findIndex(
      (item) => item.id === assignmentId && item.projectId === projectId,
    );
    if (index < 0) throw new Error("Project assignment not found");
    const updated: ProjectAssignment = {
      ...assignments[index],
      role: input.role,
      updatedAt: mockTimestamp(0),
    };
    const next = [...assignments];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.projectAssignments, next);
    return success(updated, "Project assignment updated successfully");
  },

  async unassign(projectId, assignmentId) {
    await mockDelay(120);
    assertAssignment(projectId, assignmentId);
    writeCollection(
      MOCK_COLLECTIONS.projectAssignments,
      loadAssignments().filter((item) => item.id !== assignmentId),
    );
    return success({ id: assignmentId }, "Employee unassigned successfully");
  },
};

/* -------------------------------------------------------------------------- */
/* API implementation                                                          */
/* -------------------------------------------------------------------------- */

const apiProjectService: ProjectService = {
  list: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(API_ENDPOINTS.projects(), toProjectQuery(params))
      .then((response) => mapPage(response, toProject)),

  async getById(id) {
    const [project, tags, assignments] = await Promise.all([
      apiClient.get<BackendRecord>(API_ENDPOINTS.project(id)),
      apiClient.get<BackendRecord[]>(API_ENDPOINTS.projectTags(id)),
      apiClient.get<BackendRecord[]>(API_ENDPOINTS.projectAssignments(id)),
    ]);
    return {
      ...project,
      data: {
        ...toProject(project.data),
        tags: tags.data.map(toProjectTag),
        assignments: assignments.data.map(toProjectAssignment),
      },
    };
  },

  create: (input) =>
    apiClient
      .post<BackendRecord>(API_ENDPOINTS.projects(), fromProjectInput(input))
      .then((response) => ({ ...response, data: toProject(response.data) })),

  update: (id, input) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.project(id), fromProjectInput(input))
      .then((response) => ({ ...response, data: toProject(response.data) })),

  setStatus: (id, status) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.projectStatus(id), { status: status.toUpperCase() })
      .then((response) => ({ ...response, data: toProject(response.data) })),

  remove: (id) =>
    apiClient.delete<BackendRecord>(API_ENDPOINTS.project(id)).then((response) => ({
      ...response,
      data: { id: String(asRecord(response.data).id ?? id) },
    })),

  listTags: (projectId) =>
    apiClient
      .get<BackendRecord[]>(API_ENDPOINTS.projectTags(projectId))
      .then((response) => mapList(response, toProjectTag)),

  createTag: (projectId, input) =>
    apiClient
      .post<BackendRecord>(API_ENDPOINTS.projectTags(projectId), fromProjectTagInput(input))
      .then((response) => ({ ...response, data: toProjectTag(response.data) })),

  updateTag: (projectId, tagId, input) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.projectTag(projectId, tagId), {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.color !== undefined ? { color: input.color } : {}),
      })
      .then((response) => ({ ...response, data: toProjectTag(response.data) })),

  removeTag: (projectId, tagId) =>
    apiClient
      .delete<BackendRecord>(API_ENDPOINTS.projectTag(projectId, tagId))
      .then((response) => ({ ...response, data: { id: tagId } })),

  listAssignments: (projectId) =>
    apiClient
      .get<BackendRecord[]>(API_ENDPOINTS.projectAssignments(projectId))
      .then((response) => mapList(response, toProjectAssignment)),

  listCompanyAssignments: (params) =>
    apiClient
      .get<Paginated<BackendRecord>>(API_ENDPOINTS.assignments(), params)
      .then((response) => mapPage(response, toProjectAssignment)),

  assign: (projectId, input) =>
    apiClient
      .post<BackendRecord>(
        API_ENDPOINTS.projectAssignments(projectId),
        fromProjectAssignmentInput(input),
      )
      .then((response) => ({ ...response, data: toProjectAssignment(response.data) })),

  updateAssignment: (projectId, assignmentId, input) =>
    apiClient
      .patch<BackendRecord>(API_ENDPOINTS.projectAssignment(projectId, assignmentId), {
        role: input.role.toUpperCase(),
      })
      .then((response) => ({ ...response, data: toProjectAssignment(response.data) })),

  unassign: (projectId, assignmentId) =>
    apiClient
      .delete<BackendRecord>(API_ENDPOINTS.projectAssignment(projectId, assignmentId))
      .then((response) => ({ ...response, data: { id: assignmentId } })),
};

export const projectService: ProjectService = env.useMockData
  ? mockProjectService
  : apiProjectService;

export type ProjectListResponse = ApiSuccess<Paginated<Project>>;
