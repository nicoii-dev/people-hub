"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/shared/form-dialog";
import { FormField } from "@/components/shared/form-field";
import { useCreateClient, useUpdateClient } from "@/hooks/use-clients";
import type { Client } from "@/types/client";
import {
  clientFormSchema,
  clientFormToInput,
  clientToFormValues,
  type ClientFormValues,
} from "../schemas";

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

function mutationMessage(error: unknown) {
  return error instanceof Error ? error.message : "The client could not be saved.";
}

export function ClientFormDialog({ open, onOpenChange, client }: ClientFormDialogProps) {
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: clientToFormValues(client),
  });
  const { reset, control, register, handleSubmit, formState } = form;
  const pending = createMutation.isPending || updateMutation.isPending;

  React.useEffect(() => {
    reset(clientToFormValues(client));
  }, [client, open, reset]);

  async function onSubmit(values: ClientFormValues) {
    const input = clientFormToInput(values);
    try {
      if (client) {
        await updateMutation.mutateAsync({ id: client.id, input });
        toast.success("Client updated successfully");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Client added successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(mutationMessage(error));
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={client ? "Edit client" : "Add client"}
      description={
        client ? "Update the client's details." : "Register a new client for the organization."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Client name" htmlFor="clientName" error={formState.errors.name?.message}>
            <Input id="clientName" {...register("name")} placeholder="Acme Corporation" />
          </FormField>
          <FormField label="Code" htmlFor="clientCode" error={formState.errors.code?.message}>
            <Input id="clientCode" {...register("code")} placeholder="ACME" />
          </FormField>
        </div>

        <FormField label="Company name" htmlFor="clientCompanyName" error={formState.errors.companyName?.message}>
          <Input id="clientCompanyName" {...register("companyName")} placeholder="Acme Holdings Inc." />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Contact person" htmlFor="clientContact" error={formState.errors.contactName?.message}>
            <Input id="clientContact" {...register("contactName")} />
          </FormField>
          <FormField label="Email" htmlFor="clientEmail" error={formState.errors.email?.message}>
            <Input id="clientEmail" type="email" {...register("email")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone" htmlFor="clientPhone" error={formState.errors.phone?.message}>
            <Input id="clientPhone" {...register("phone")} />
          </FormField>
          <FormField label="Industry" htmlFor="clientIndustry" error={formState.errors.industry?.message}>
            <Input id="clientIndustry" {...register("industry")} />
          </FormField>
        </div>

        <FormField label="Address" htmlFor="clientAddress" error={formState.errors.address?.message}>
          <Textarea id="clientAddress" {...register("address")} />
        </FormField>

        <FormField label="Description / notes" htmlFor="clientDescription" error={formState.errors.description?.message}>
          <Textarea id="clientDescription" {...register("description")} />
        </FormField>

        <FormField label="Status" error={formState.errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : client ? "Save changes" : "Add client"}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
