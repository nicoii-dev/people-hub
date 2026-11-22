export interface Position {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  level: "Junior" | "Mid" | "Senior" | "Lead" | "Manager" | "Director";
  salaryGrade: number;
  salaryMin: number;
  salaryMax: number;
}

export interface PositionCreateInput {
  title: string;
  code: string;
  departmentId: string;
  level: Position["level"];
  salaryGrade: number;
  salaryMin: number;
  salaryMax: number;
}

export type PositionUpdateInput = Partial<PositionCreateInput>;
