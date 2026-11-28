import type { Metadata } from "next";
import { EmployeeTeamView } from "@/features/employee/employee-team-view";

export const metadata: Metadata = {
  title: "Team Directory",
};

export default function EmployeeTeamPage() {
  return <EmployeeTeamView />;
}
