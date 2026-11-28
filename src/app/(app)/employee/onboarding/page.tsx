import type { Metadata } from "next";
import { EmployeeOnboardingView } from "@/features/employee/employee-onboarding-view";

export const metadata: Metadata = {
  title: "My onboarding",
};

export default function EmployeeOnboardingPage() {
  return <EmployeeOnboardingView />;
}
