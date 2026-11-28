import { z } from "zod";
import type { Client, ClientCreateInput } from "@/types/client";

const optionalText = (max: number) => z.string().trim().max(max);

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Client name is required").max(150),
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(50)
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Use letters, numbers, hyphens, or underscores only"),
  companyName: optionalText(150),
  contactName: optionalText(150),
  email: z.union([z.string().trim().email("Enter a valid email address"), z.literal("")]),
  phone: optionalText(50),
  address: optionalText(500),
  industry: optionalText(100),
  description: optionalText(1000),
  status: z.enum(["active", "inactive"]),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export function clientToFormValues(client?: Client | null): ClientFormValues {
  if (!client) {
    return {
      name: "",
      code: "",
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      description: "",
      status: "active",
    };
  }

  return {
    name: client.name,
    code: client.code,
    companyName: client.companyName,
    contactName: client.contactName,
    email: client.email,
    phone: client.phone,
    address: client.address,
    industry: client.industry,
    description: client.description,
    status: client.status,
  };
}

function optionalValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function clientFormToInput(values: ClientFormValues): ClientCreateInput {
  return {
    name: values.name,
    code: values.code.toUpperCase(),
    companyName: optionalValue(values.companyName),
    contactName: optionalValue(values.contactName),
    email: optionalValue(values.email),
    phone: optionalValue(values.phone),
    address: optionalValue(values.address),
    industry: optionalValue(values.industry),
    description: optionalValue(values.description),
    status: values.status,
  };
}
