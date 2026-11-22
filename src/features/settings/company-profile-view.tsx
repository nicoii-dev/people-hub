"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/error-state";
import { FormField } from "@/components/shared/form-field";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { usePermission } from "@/features/auth/hooks";
import {
  useCompanyProfile,
  useUpdateCompanyProfile,
} from "@/hooks/use-settings";
import { companyProfileSchema, type CompanyProfileFormValues } from "./schemas";

export function CompanyProfileView() {
  const canManage = usePermission("settings:manage");
  const profileQuery = useCompanyProfile();
  const mutation = useUpdateCompanyProfile();
  const form = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: "",
      legalName: "",
      industry: "",
      email: "",
      phone: "",
      website: "",
      taxId: "",
      addressLine1: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
    },
  });
  const { register, handleSubmit, reset, formState } = form;

  React.useEffect(() => {
    if (profileQuery.data?.data) reset(profileQuery.data.data);
  }, [profileQuery.data, reset]);

  async function onSubmit(values: CompanyProfileFormValues) {
    try {
      await mutation.mutateAsync(values);
      toast.success("Company profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The profile could not be saved.");
    }
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        title="Company profile unavailable"
        description="Company details could not be loaded."
        error={profileQuery.error}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  }

  if (profileQuery.isPending || !profileQuery.data) {
    return <LoadingSkeleton variant="detail" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company details</CardTitle>
        <CardDescription>
          {canManage
            ? "Update the organization information used across the workspace."
            : "Your role has read-only access to company details."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Company name" htmlFor="companyName" error={formState.errors.companyName?.message}>
              <Input id="companyName" {...register("companyName")} disabled={!canManage} />
            </FormField>
            <FormField label="Legal name" htmlFor="legalName" error={formState.errors.legalName?.message}>
              <Input id="legalName" {...register("legalName")} disabled={!canManage} />
            </FormField>
            <FormField label="Industry" htmlFor="industry" error={formState.errors.industry?.message}>
              <Input id="industry" {...register("industry")} disabled={!canManage} />
            </FormField>
            <FormField label="Tax ID" htmlFor="taxId" error={formState.errors.taxId?.message}>
              <Input id="taxId" {...register("taxId")} disabled={!canManage} />
            </FormField>
            <FormField label="Email" htmlFor="companyEmail" error={formState.errors.email?.message}>
              <Input id="companyEmail" type="email" {...register("email")} disabled={!canManage} />
            </FormField>
            <FormField label="Phone" htmlFor="companyPhone" error={formState.errors.phone?.message}>
              <Input id="companyPhone" {...register("phone")} disabled={!canManage} />
            </FormField>
            <FormField label="Website" htmlFor="companyWebsite" error={formState.errors.website?.message}>
              <Input id="companyWebsite" {...register("website")} disabled={!canManage} />
            </FormField>
            <FormField label="Address" htmlFor="addressLine1" error={formState.errors.addressLine1?.message}>
              <Input id="addressLine1" {...register("addressLine1")} disabled={!canManage} />
            </FormField>
            <FormField label="City" htmlFor="city" error={formState.errors.city?.message}>
              <Input id="city" {...register("city")} disabled={!canManage} />
            </FormField>
            <FormField label="Region / State" htmlFor="region" error={formState.errors.region?.message}>
              <Input id="region" {...register("region")} disabled={!canManage} />
            </FormField>
            <FormField label="Postal code" htmlFor="postalCode" error={formState.errors.postalCode?.message}>
              <Input id="postalCode" {...register("postalCode")} disabled={!canManage} />
            </FormField>
            <FormField label="Country" htmlFor="country" error={formState.errors.country?.message}>
              <Input id="country" {...register("country")} disabled={!canManage} />
            </FormField>
          </div>

          {canManage ? (
            <div className="flex justify-end border-t pt-4">
              <Button type="submit" disabled={mutation.isPending}>
                <Save />
                {mutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
