import type { Metadata } from "next";
import { PayrollView } from "@/features/payroll/payroll-view";

export const metadata: Metadata = {
  title: "Payroll",
};

export default function PayrollPage() {
  return <PayrollView />;
}
