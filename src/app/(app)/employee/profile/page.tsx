import type { Metadata } from "next";
import { EmployeeProfileView } from "@/features/employee/employee-profile-view";

export const metadata: Metadata = {
  title: "My profile",
};

export default function EmployeeProfilePage() {
  return <EmployeeProfileView />;
}
