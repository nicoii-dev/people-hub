import type { Metadata } from "next";
import { RecruitmentView } from "@/features/recruitment/recruitment-view";

export const metadata: Metadata = {
  title: "Recruitment",
};

export default function RecruitmentPage() {
  return <RecruitmentView />;
}
