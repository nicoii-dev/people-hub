import type { Metadata } from "next";
import { EmployeeDetailView } from "@/features/employees/employee-detail-view";

export const metadata: Metadata = {
  title: "Employee profile",
};

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmployeeDetailView employeeId={id} />;
}
