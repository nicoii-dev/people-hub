import type { Metadata } from "next";
import { TimesheetView } from "@/features/timesheet/timesheet-view";

export const metadata: Metadata = {
  title: "Timesheet",
};

export default function TimesheetPage() {
  return <TimesheetView />;
}
