import type { Metadata } from "next";
import { DepartmentsView } from "@/features/departments/departments-view";

export const metadata: Metadata = {
  title: "Departments",
};

export default function DepartmentsPage() {
  return <DepartmentsView />;
}
