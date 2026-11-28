import type { Metadata } from "next";
import { TimeEntriesView } from "@/features/time-entries/time-entries-view";

export const metadata: Metadata = {
  title: "Time Entries",
};

export default function TimeEntriesPage() {
  return <TimeEntriesView />;
}
