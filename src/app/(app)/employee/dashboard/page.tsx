import type { Metadata } from "next";
import { EmployeeDashboardView } from "@/features/employee/employee-dashboard-view";

export const metadata: Metadata = {
  title: "Employee Dashboard",
};

export default function EmployeeDashboardPage() {
  return <EmployeeDashboardView />;
}
