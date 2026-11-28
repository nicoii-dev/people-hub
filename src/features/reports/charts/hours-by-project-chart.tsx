"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectReportItem } from "@/types/project-report";

interface HoursByProjectChartProps {
  data: ProjectReportItem[];
}

export function HoursByProjectChart({ data }: HoursByProjectChartProps) {
  const chartData = data.map((project) => ({
    project: project.name,
    hours: Math.round((project.durationMinutes / 60) * 10) / 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 48, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="project"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={11} />
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
        <Bar dataKey="hours" name="Hours" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
