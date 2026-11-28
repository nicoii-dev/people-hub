"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/mock-auth.service";
import { useAppDispatch } from "@/store";
import { setSession } from "@/store/slices/auth";
import {
  TRIAL_FEATURES,
  type TrialFeature,
} from "@/types/trial";
import {
  registerCompanySchema,
  type RegisterCompanyFormValues,
} from "../schemas";

const featureLabels: Record<TrialFeature, string> = {
  employees: "Employee directory",
  projects: "Projects & clients",
  assignments: "Team assignments",
  "time-entries": "Timesheets & time entries",
};

export function RegisterCompanyForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<RegisterCompanyFormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      companyName: "",
      slug: "",
      features: [...TRIAL_FEATURES],
    },
  });

  async function submit(values: RegisterCompanyFormValues) {
    setServerError(null);
    try {
      const result = await authService.registerCompany({
        ...values,
        slug: values.slug || undefined,
        features: values.features as TrialFeature[],
      });
      dispatch(setSession(result.session));
      toast.success("Your 14-day trial is ready");
      router.push("/onboarding");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create your workspace.";
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2 className="size-6" />
        </span>
        <CardTitle className="mt-3 text-2xl">Start your free trial</CardTitle>
        <CardDescription>
          Create your account and register your organization. No card required for 14 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5 flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <Badge variant="secondary">14-day trial · selected HRIS features</Badge>
        </div>

        <form className="grid gap-4" onSubmit={form.handleSubmit((values) => void submit(values))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" error={form.formState.errors.firstName?.message}>
              <Input {...form.register("firstName")} autoComplete="given-name" placeholder="Juan" />
            </Field>
            <Field label="Last name" error={form.formState.errors.lastName?.message}>
              <Input {...form.register("lastName")} autoComplete="family-name" placeholder="Dela Cruz" />
            </Field>
          </div>

          <Field label="Work email" error={form.formState.errors.email?.message}>
            <Input
              {...form.register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
          </Field>

          <Field label="Password" error={form.formState.errors.password?.message}>
            <Input
              {...form.register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters with a number"
            />
          </Field>

          <Field label="Company name" error={form.formState.errors.companyName?.message}>
            <Input {...form.register("companyName")} autoComplete="organization" placeholder="Acme People Systems" />
          </Field>

          <Field
            label="Workspace URL"
            error={form.formState.errors.slug?.message}
            hint="Optional — generated from your company name"
          >
            <div className="flex items-center rounded-md border border-input bg-background">
              <span className="px-3 text-sm text-muted-foreground">peoplehub.app/</span>
              <Input
                {...form.register("slug")}
                className="border-0 shadow-none"
                placeholder="acme-people-systems"
              />
            </div>
          </Field>

          <div className="grid gap-2">
            <Label>Features to explore</Label>
            <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
              {TRIAL_FEATURES.map((feature) => (
                <Controller
                  key={feature}
                  control={form.control}
                  name="features"
                  render={({ field }) => {
                    const selected = (field.value ?? []) as TrialFeature[];
                    return (
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={selected.includes(feature)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked === true
                                ? [...new Set([...selected, feature])]
                                : selected.filter((item) => item !== feature),
                            )
                          }
                        />
                        {featureLabels[feature]}
                      </label>
                    );
                  }}
                />
              ))}
            </div>
            {form.formState.errors.features ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.features.message ?? "Select at least one feature"}
              </p>
            ) : null}
          </div>

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating workspace..." : "Create account & start trial"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <UsersRound className="size-4" />
            Already registered?
          </span>
          <Link href="/dashboard" className="font-medium text-foreground underline underline-offset-4">
            Open workspace
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label>{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
