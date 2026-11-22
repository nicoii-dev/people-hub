import { env } from "@/config/env";
import { notificationSeed } from "@/data/notifications";
import { success } from "@/lib/result";
import type { ServiceResult } from "@/types/api";
import type { AppNotification } from "@/types/notification";
import { apiClient } from "./api/client";
import { API_ENDPOINTS } from "./api/endpoints";
import {
  MOCK_COLLECTIONS,
  mockDelay,
  readCollection,
  writeCollection,
} from "./mock/persistence";

export interface NotificationService {
  list(): ServiceResult<AppNotification[]>;
  markRead(id: string): ServiceResult<AppNotification>;
  markAllRead(): ServiceResult<AppNotification[]>;
}

function loadNotifications() {
  return readCollection(MOCK_COLLECTIONS.notifications, notificationSeed);
}

const mockNotificationService: NotificationService = {
  async list() {
    await mockDelay(70);
    return success(loadNotifications(), "Notifications retrieved successfully");
  },

  async markRead(id) {
    await mockDelay(80);
    const notifications = loadNotifications();
    const index = notifications.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Notification not found");
    const updated = { ...notifications[index], read: true };
    const next = [...notifications];
    next[index] = updated;
    writeCollection(MOCK_COLLECTIONS.notifications, next);
    return success(updated, "Notification marked as read");
  },

  async markAllRead() {
    await mockDelay(100);
    const next = loadNotifications().map((item) => ({ ...item, read: true }));
    writeCollection(MOCK_COLLECTIONS.notifications, next);
    return success(next, "All notifications marked as read");
  },
};

const apiNotificationService: NotificationService = {
  list: () => apiClient.get<AppNotification[]>(API_ENDPOINTS.notifications),
  markRead: (id) => apiClient.patch<AppNotification>(`${API_ENDPOINTS.notifications}/${id}/read`, {}),
  markAllRead: () => apiClient.patch<AppNotification[]>(`${API_ENDPOINTS.notifications}/read-all`, {}),
};

export const notificationService: NotificationService = env.useMockData
  ? mockNotificationService
  : apiNotificationService;
