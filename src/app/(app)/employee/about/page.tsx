import type { Metadata } from "next";
import { EmployeeAboutView } from "@/features/employee/employee-about-view";

export const metadata: Metadata = {
  title: "About Company",
};

export default function EmployeeAboutPage() {
  return <EmployeeAboutView />;
}
