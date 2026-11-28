"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Cake,
  ClipboardList,
  Megaphone,
  Pin,
  UserCircle,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmployeeAvatar } from "@/components/shared/employee-avatar";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks";
import { useBirthdays } from "@/hooks/use-birthdays";
import { useAnnouncements } from "@/hooks/use-employee-portal";
import { formatDateTime } from "@/lib/utils";
import type { AnnouncementCategory } from "@/types/employee-portal";

const quickActions: Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}> = [
  {
    title: "My onboarding",
    description: "Review your checklist and documents.",
    href: "/employee/onboarding",
    icon: ClipboardList,
  },
  {
    title: "Team Directory",
    description: "Find colleagues and clock in or out.",
    href: "/employee/team",
    icon: UsersRound,
  },
  {
    title: "About Company",
    description: "Read policies and the handbook.",
    href: "/employee/about",
    icon: Building2,
  },
  {
    title: "My profile",
    description: "View your latest employee details.",
    href: "/employee/profile",
    icon: UserCircle,
  },
];

const categoryLabels: Record<AnnouncementCategory, string> = {
  company: "Company",
  people: "People",
  events: "Event",
  policy: "Policy",
};

const categoryVariants = {
  company: "default",
  people: "success",
  events: "warning",
  policy: "secondary",
} as const;

export function EmployeeDashboardView() {
  const { user } = useAuth();
  const month = new Date().getMonth() + 1;
  const announcements = useAnnouncements();
  const birthdays = useBirthdays(month);

  const firstName = user?.firstName ?? "there";
  const birthdayList = birthdays.data?.data.birthdays ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good day, ${firstName}`}
        description="Your home base for company updates, quick actions, and the people celebrating this month."
      />

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <span className="text-sm text-muted-foreground">Everything you need, one click away</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full transition-colors hover:border-primary/50 hover:bg-accent/40">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Open <ArrowRight className="size-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>Latest updates from PeopleHub leadership and People Operations.</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.isPending ? (
              <LoadingSkeleton variant="detail" />
            ) : announcements.isError ? (
              <p className="text-sm text-destructive">Announcements could not be loaded.</p>
            ) : (
              <div className="space-y-3">
                {(announcements.data?.data ?? []).map((announcement) => (
                  <article
                    key={announcement.id}
                    className="rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={categoryVariants[announcement.category]}>
                          {categoryLabels[announcement.category]}
                        </Badge>
                        {announcement.pinned ? (
                          <Badge variant="outline" className="gap-1">
                            <Pin className="size-3" /> Pinned
                          </Badge>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(announcement.publishedAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{announcement.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{announcement.summary}</p>
                    <p className="mt-2 text-xs text-muted-foreground">By {announcement.author}</p>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="size-5 text-pink-500" />
              Birthdays this month
            </CardTitle>
            <CardDescription>
              {birthdays.data?.data.monthName ?? "Current month"} · celebrating {birthdayList.length}{" "}
              teammate{birthdayList.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {birthdays.isPending ? (
              <LoadingSkeleton variant="cards" count={2} />
            ) : birthdays.isError ? (
              <p className="text-sm text-destructive">Birthdays could not be loaded.</p>
            ) : birthdayList.length ? (
              <div className="space-y-3">
                {birthdayList.map((birthday) => (
                  <div key={birthday.employeeId} className="flex items-center gap-3 rounded-lg border p-3">
                    <EmployeeAvatar
                      firstName={birthday.firstName}
                      lastName={birthday.lastName}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {birthday.preferredName || `${birthday.firstName} ${birthday.lastName}`}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{birthday.email}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {birthday.month}/{birthday.day}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Cake className="mx-auto size-6 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No birthdays this month</p>
                <p className="mt-1 text-xs text-muted-foreground">Check back next month.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Need something else?</p>
            <p className="text-sm text-muted-foreground">
              Policies, benefits, and workplace guidance are all in About Company.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/employee/about">
              Open handbook <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
