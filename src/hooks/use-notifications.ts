"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { queryKeys } from "./query-keys";

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => notificationService.list(),
  });
}

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  };
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: string) =>
      notificationService.markRead(id).then((response) => response.data),
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: () => notificationService.markAllRead().then((response) => response.data),
    onSuccess: invalidate,
  });
}
