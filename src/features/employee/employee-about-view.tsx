"use client";

import {
  BookOpen,
  Building2,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCompanyInformation } from "@/hooks/use-employee-portal";
import { formatDate } from "@/lib/utils";

function ContactRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function EmployeeAboutView() {
  const info = useCompanyInformation();

  if (info.isPending) {
    return <LoadingSkeleton variant="cards" count={4} />;
  }

  if (info.isError || !info.data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Company information could not be loaded.
        </CardContent>
      </Card>
    );
  }

  const { profile, policies, handbook } = info.data.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="About Company"
        description="Learn about PeopleHub, the policies that guide us, and where to find the company handbook."
      />

      <Card className="overflow-hidden border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">{profile.companyName}</h2>
              <p className="text-sm text-muted-foreground">{profile.legalName}</p>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                We build human-centered technology that helps teams hire, develop, and care for their
                people. This page is your starting point for the policies and guidance that shape
                life at PeopleHub.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 self-start">{profile.industry}</Badge>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              Company details
            </CardTitle>
            <CardDescription>Official business information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContactRow icon={MapPin} label="Address" value={`${profile.addressLine1}, ${profile.city}, ${profile.region} ${profile.postalCode}, ${profile.country}`} />
            <ContactRow icon={Mail} label="Email" value={profile.email} />
            <ContactRow icon={Phone} label="Phone" value={profile.phone} />
            <ContactRow icon={Globe2} label="Website" value={profile.website} />
            <Separator />
            <ContactRow icon={FileText} label="Tax ID" value={profile.taxId} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Company policies
            </CardTitle>
            <CardDescription>Key policies every employee should know.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {policies.map((policy) => (
              <div key={policy.id} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{policy.title}</p>
                  <Badge variant="outline">{policy.category}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{policy.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {policy.details.map((detail) => (
                    <li key={detail} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Updated {formatDate(policy.updatedAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            Employee handbook
          </CardTitle>
          <CardDescription>Browse the sections and topics in the company handbook.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {handbook.map((section) => (
            <div key={section.id} className="rounded-lg border p-4">
              <p className="text-sm font-semibold">{section.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{section.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {section.topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-[11px]">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
