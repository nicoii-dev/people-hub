"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import type { ListParams } from "@/types/api";
import type {
  ProjectAssignmentCreateInput,
  ProjectAssignmentRole,
  ProjectCreateInput,
  ProjectListParams,
  ProjectStatus,
  ProjectTagCreateInput,
  ProjectUpdateInput,
} from "@/types/project";
import { queryKeys } from "./query-keys";

export function useProjects(params?: ProjectListParams) {
  return useQuery({
    queryKey: queryKeys.projectList(params),
    queryFn: () => projectService.list(params),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectService.getById(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectTags(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectTags(projectId),
    queryFn: () => projectService.listTags(projectId),
    enabled: Boolean(projectId),
  });
}

export function useProjectAssignments(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projectAssignments(projectId),
    queryFn: () => projectService.listAssignments(projectId),
    enabled: Boolean(projectId),
  });
}

export function useCompanyAssignments(params?: ListParams) {
  return useQuery({
    queryKey: [...queryKeys.companyAssignments, params ?? {}],
    queryFn: () => projectService.listCompanyAssignments(params),
  });
}

function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.projects });
    void queryClient.invalidateQueries({ queryKey: queryKeys.companyAssignments });
    void queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    void queryClient.invalidateQueries({ queryKey: queryKeys.projectReport });
  };
}

export function useCreateProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (input: ProjectCreateInput) =>
      projectService.create(input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectUpdateInput }) =>
      projectService.update(id, input).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useUpdateProjectStatus() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProjectStatus }) =>
      projectService.setStatus(id, status).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useDeleteProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: (id: string) => projectService.remove(id).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useCreateProjectTag() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: ProjectTagCreateInput;
    }) => projectService.createTag(projectId, input).then((response) => response.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projectTags(variables.projectId),
      });
      invalidate();
    },
  });
}

export function useUpdateProjectTag() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({
      projectId,
      tagId,
      input,
    }: {
      projectId: string;
      tagId: string;
      input: Partial<ProjectTagCreateInput>;
    }) =>
      projectService.updateTag(projectId, tagId, input).then((response) => response.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projectTags(variables.projectId),
      });
      invalidate();
    },
  });
}

export function useDeleteProjectTag() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ projectId, tagId }: { projectId: string; tagId: string }) =>
      projectService.removeTag(projectId, tagId).then((response) => response.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projectTags(variables.projectId),
      });
      invalidate();
    },
  });
}

export function useAssignEmployee() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: string;
      input: ProjectAssignmentCreateInput;
    }) => projectService.assign(projectId, input).then((response) => response.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projectAssignments(variables.projectId),
      });
      invalidate();
    },
  });
}

export function useUpdateAssignmentRole() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({
      projectId,
      assignmentId,
      role,
    }: {
      projectId: string;
      assignmentId: string;
      role: ProjectAssignmentRole;
    }) =>
      projectService
        .updateAssignment(projectId, assignmentId, { role })
        .then((response) => response.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projectAssignments(variables.projectId),
      });
      invalidate();
    },
  });
}

export function useUnassignEmployee() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ projectId, assignmentId }: { projectId: string; assignmentId: string }) =>
      projectService.unassign(projectId, assignmentId).then((response) => response.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projectAssignments(variables.projectId),
      });
      invalidate();
    },
  });
}
