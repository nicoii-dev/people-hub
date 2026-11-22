import { BadgeDollarSign, Banknote, ReceiptText, UsersRound } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import type { PayrollPeriod } from "@/types/payroll";

interface PayrollSummaryCardsProps {
  period: PayrollPeriod | undefined;
  employeeCount: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  loading?: boolean;
}

export function PayrollSummaryCards({
  period,
  employeeCount,
  grossPay,
  deductions,
  netPay,
  loading = false,
}: PayrollSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Gross pay"
        value={new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(grossPay)}
        icon={BadgeDollarSign}
        description={period ? period.label : "No period selected"}
        loading={loading}
      />
      <StatCard
        title="Net pay"
        value={new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(netPay)}
        icon={Banknote}
        description="After taxes and contributions"
        loading={loading}
      />
      <StatCard
        title="Deductions"
        value={new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(deductions)}
        icon={ReceiptText}
        description="Taxes, loans, and contributions"
        loading={loading}
      />
      <StatCard
        title="Employees"
        value={employeeCount}
        icon={UsersRound}
        description="Records in selected period"
        loading={loading}
      />
    </div>
  );
}
