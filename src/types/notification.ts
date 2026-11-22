export type NotificationKind = "leave" | "attendance" | "payroll" | "recruitment" | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
  href: string | null;
}
