export type ClientStatus = "active" | "inactive";

export interface Client {
  id: string;
  name: string;
  companyName: string;
  code: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  description: string;
  status: ClientStatus;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ClientCreateInput {
  name: string;
  code: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  description?: string;
  status: ClientStatus;
}

export type ClientUpdateInput = Partial<ClientCreateInput>;
