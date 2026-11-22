"use client";

import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/use-notifications";

function timestampLabel(value: string) {
  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  return `${date} · ${time}`;
}

export function NotificationsMenu() {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const notifications = data?.data ?? [];
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell />
          {unread > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{unread} unread</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={!unread || markAllRead.isPending}
            onClick={() => {
              markAllRead.mutate();
              toast.success("All notifications marked as read");
            }}
          >
            <CheckCheck className="size-4" />
            Mark all
          </Button>
        </div>
        <Separator />
        <div className="scrollbar-thin max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Loading notifications…</p>
          ) : notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.read) {
                    markRead.mutate(notification.id);
                  }
                }}
                className="flex w-full gap-3 border-b p-4 text-left transition-colors last:border-0 hover:bg-accent"
              >
                <span
                  className={`mt-1 size-2 shrink-0 rounded-full ${notification.read ? "bg-muted-foreground/30" : "bg-primary"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{notification.title}</p>
                    {!notification.read ? <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">New</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{timestampLabel(notification.createdAt)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
