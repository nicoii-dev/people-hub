"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
} from "@/hooks/use-platform";
import type { SubscriptionPlan } from "@/types/platform";
import {
  subscriptionPlanSchema,
  type SubscriptionPlanFormValues,
} from "../schemas";

interface SubscriptionPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: SubscriptionPlan | null;
}

const defaults: SubscriptionPlanFormValues = {
  name: "",
  description: "",
  currency: "PHP",
  priceMonthly: 0,
  priceYearly: 0,
  employeeLimit: 25,
  features: "",
  status: "active",
  popular: false,
};

export function SubscriptionPlanFormDialog({
  open,
  onOpenChange,
  plan,
}: SubscriptionPlanFormDialogProps) {
  const createPlan = useCreateSubscriptionPlan();
  const updatePlan = useUpdateSubscriptionPlan();
  const form = useForm<SubscriptionPlanFormValues>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: defaults,
  });
  const { register, handleSubmit, reset, control, formState } = form;

  React.useEffect(() => {
    if (!open) return;
    reset(
      plan
        ? {
            name: plan.name,
            description: plan.description,
            currency: plan.currency,
            priceMonthly: plan.priceMonthly,
            priceYearly: plan.priceYearly,
            employeeLimit: plan.employeeLimit,
            features: plan.features.join("\n"),
            status: plan.status,
            popular: plan.popular,
          }
        : defaults,
    );
  }, [open, plan, reset]);

  async function onSubmit(values: SubscriptionPlanFormValues) {
    const payload = {
      ...values,
      features: values.features
        .split(/\n|,/)
        .map((feature) => feature.trim())
        .filter(Boolean),
    };

    try {
      if (plan) {
        await updatePlan.mutateAsync({ id: plan.id, values: payload });
        toast.success("Subscription plan updated");
      } else {
        await createPlan.mutateAsync(payload);
        toast.success("Subscription plan created");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The plan could not be saved.");
    }
  }

  const pending = createPlan.isPending || updatePlan.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{plan ? `Edit ${plan.name}` : "Create subscription plan"}</DialogTitle>
          <DialogDescription>
            Define pricing, limits, and the features included in this plan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Plan name" htmlFor="planName" error={formState.errors.name?.message}>
            <Input id="planName" {...register("name")} />
          </FormField>

          <FormField
            label="Description"
            htmlFor="planDescription"
            error={formState.errors.description?.message}
          >
            <Textarea id="planDescription" rows={2} {...register("description")} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Currency"
              htmlFor="planCurrency"
              error={formState.errors.currency?.message}
            >
              <Input id="planCurrency" {...register("currency")} />
            </FormField>
            <FormField
              label="Monthly price"
              htmlFor="planPriceMonthly"
              error={formState.errors.priceMonthly?.message}
            >
              <Input
                id="planPriceMonthly"
                type="number"
                min={0}
                {...register("priceMonthly", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Yearly price"
              htmlFor="planPriceYearly"
              error={formState.errors.priceYearly?.message}
            >
              <Input
                id="planPriceYearly"
                type="number"
                min={0}
                {...register("priceYearly", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Employee limit"
              htmlFor="planEmployeeLimit"
              error={formState.errors.employeeLimit?.message}
            >
              <Input
                id="planEmployeeLimit"
                type="number"
                min={1}
                {...register("employeeLimit", { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              label="Status"
              error={formState.errors.status?.message}
            >
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-label="Plan status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <FormField
            label="Features"
            htmlFor="planFeatures"
            hint="Enter one feature per line."
            error={formState.errors.features?.message}
          >
            <Textarea id="planFeatures" rows={4} {...register("features")} />
          </FormField>

          <Controller
            control={control}
            name="popular"
            render={({ field }) => (
              <label className="flex items-center justify-between rounded-lg border p-3">
                <span>
                  <span className="block text-sm font-medium">Mark as popular</span>
                  <span className="block text-xs text-muted-foreground">
                    Highlight this plan on the signup page.
                  </span>
                </span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </label>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              <Save />
              {pending ? "Saving…" : "Save plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
