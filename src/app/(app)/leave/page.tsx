import type { Metadata } from "next";
import { LeaveView } from "@/features/leaves/leave-view";

export const metadata: Metadata = {
  title: "Leave Management",
};

export default function LeavePage() {
  return <LeaveView />;
}
