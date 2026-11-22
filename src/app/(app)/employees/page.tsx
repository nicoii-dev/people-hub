import type { Metadata } from "next";
import { EmployeeDirectory } from "@/features/employees/employee-directory";

export const metadata: Metadata = {
  title: "Employees",
};

export default function EmployeesPage() {
  return <EmployeeDirectory />;
}
