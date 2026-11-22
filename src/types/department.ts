export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  managerId: string | null;
  parentId: string | null;
  location: string;
  createdAt: string;
}

export interface DepartmentCreateInput {
  name: string;
  code: string;
  description: string;
  managerId: string | null;
  parentId: string | null;
  location: string;
}

export type DepartmentUpdateInput = Partial<DepartmentCreateInput>;
