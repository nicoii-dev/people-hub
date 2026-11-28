"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";
import { ErrorState } from "@/components/shared/error-state";
import { FormField } from "@/components/shared/form-field";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { usePermission } from "@/features/auth/hooks";
import {
  usePlatformSettings,
  useSubscriptionPlans,
  useUpdatePlatformSettings,
} from "@/hooks/use-platform";
import { formatDateTime } from "@/lib/utils";
import {
  platformSettingsSchema,
  type PlatformSettingsFormValues,
} from "./schemas";

export function PlatformSettingsView() {
  const canManage = usePermission("platform-settings:manage");
  const settings = usePlatformSettings();
  const plans = useSubscriptionPlans();
  const updateSettings = useUpdatePlatformSettings();
  const form = useForm<PlatformSettingsFormValues>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      platformName: "",
      supportEmail: "",
      billingEmail: "",
      defaultPlanId: "",
      defaultCurrency: "PHP",
      timezone: "Asia/Manila",
      sessionTimeoutMinutes: 60,
      allowSignups: true,
      maintenanceMode: false,
    },
  });
  const { register, handleSubmit, reset, control, formState } = form;
  const maintenanceMode = settings.data?.data.maintenanceMode ?? false;

  React.useEffect(() => {
    if (settings.data?.data) reset(settings.data.data);
  }, [reset, settings.data]);

  async function onSubmit(values: PlatformSettingsFormValues) {
    try {
      await updateSettings.mutateAsync(values);
      toast.success("Platform settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Settings could not be saved.");
    }
  }

  if (settings.isError || plans.isError) {
    return (
      <ErrorState
        title="Platform settings unavailable"
        description="Settings could not be loaded."
        error={settings.error ?? plans.error}
        onRetry={() => {
          void settings.refetch();
          void plans.refetch();
        }}
      />
    );
  }

  if (settings.isPending || !settings.data) {
    return <LoadingSkeleton variant="detail" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform settings"
        description="Control platform-wide defaults, access, and operational behavior."
      />

      {maintenanceMode ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Maintenance mode is enabled</p>
            <p className="mt-1 text-xs">
              Tenant access may be restricted until maintenance mode is disabled and saved.
            </p>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Identity and regional defaults for the platform.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Platform name"
              htmlFor="platformName"
              error={formState.errors.platformName?.message}
            >
              <Input id="platformName" {...register("platformName")} disabled={!canManage} />
            </FormField>
            <FormField
              label="Default currency"
              htmlFor="defaultCurrency"
              error={formState.errors.defaultCurrency?.message}
            >
              <Input id="defaultCurrency" {...register("defaultCurrency")} disabled={!canManage} />
            </FormField>
            <FormField
              label="Support email"
              htmlFor="supportEmail"
              error={formState.errors.supportEmail?.message}
            >
              <Input id="supportEmail" type="email" {...register("supportEmail")} disabled={!canManage} />
            </FormField>
            <FormField
              label="Billing email"
              htmlFor="billingEmail"
              error={formState.errors.billingEmail?.message}
            >
              <Input id="billingEmail" type="email" {...register("billingEmail")} disabled={!canManage} />
            </FormField>
            <FormField label="Timezone" error={formState.errors.timezone?.message}>
              <Input id="timezone" {...register("timezone")} disabled={!canManage} />
            </FormField>
            <FormField
              label="Session timeout (minutes)"
              htmlFor="sessionTimeoutMinutes"
              error={formState.errors.sessionTimeoutMinutes?.message}
            >
              <Input
                id="sessionTimeoutMinutes"
                type="number"
                min={5}
                {...register("sessionTimeoutMinutes", { valueAsNumber: true })}
                disabled={!canManage}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions & access</CardTitle>
            <CardDescription>Defaults applied when a new company is registered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Default plan" error={formState.errors.defaultPlanId?.message}>
              <Controller
                control={control}
                name="defaultPlanId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canManage}>
                    <SelectTrigger aria-label="Default plan" className="sm:max-w-sm">
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {(plans.data?.data ?? []).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <Controller
              control={control}
              name="allowSignups"
              render={({ field }) => (
                <label className="flex items-center justify-between rounded-lg border p-4">
                  <span>
                    <span className="block text-sm font-medium">Allow new signups</span>
                    <span className="block text-xs text-muted-foreground">
                      Let new companies create an account on the platform.
                    </span>
                  </span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!canManage} />
                </label>
              )}
            />

            <Controller
              control={control}
              name="maintenanceMode"
              render={({ field }) => (
                <label className="flex items-center justify-between rounded-lg border p-4">
                  <span>
                    <span className="block text-sm font-medium">Maintenance mode</span>
                    <span className="block text-xs text-muted-foreground">
                      Temporarily restrict tenant access during platform maintenance.
                    </span>
                  </span>
                  <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!canManage} />
                </label>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Last updated {formatDateTime(settings.data.data.updatedAt)}
          </p>
          {canManage ? (
            <Button type="submit" disabled={updateSettings.isPending}>
              <Save />
              {updateSettings.isPending ? "Saving…" : "Save platform settings"}
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
