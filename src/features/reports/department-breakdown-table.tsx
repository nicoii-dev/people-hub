import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/utils";
import type { DepartmentReportItem } from "@/types/report";

interface DepartmentBreakdownTableProps {
  data: DepartmentReportItem[];
}

export function DepartmentBreakdownTable({ data }: DepartmentBreakdownTableProps) {
  const totalCost = data.reduce((total, item) => total + item.payrollCost, 0);
  const columns: DataTableColumn<DepartmentReportItem>[] = [
    {
      id: "department",
      header: "Department",
      cellClassName: "min-w-44",
      cell: (item) => <span className="text-sm font-medium">{item.department}</span>,
    },
    {
      id: "employees",
      header: "Employees",
      cell: (item) => <span className="text-sm tabular-nums">{item.employees}</span>,
    },
    {
      id: "payrollCost",
      header: "Payroll cost",
      cell: (item) => <span className="text-sm tabular-nums">{formatCurrency(item.payrollCost)}</span>,
    },
    {
      id: "share",
      header: "Cost share",
      cell: (item) => (
        <span className="text-sm tabular-nums">
          {totalCost ? `${Math.round((item.payrollCost / totalCost) * 100)}%` : "—"}
        </span>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} getRowId={(item) => item.department} />;
}
