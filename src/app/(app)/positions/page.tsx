import type { Metadata } from "next";
import { PositionsView } from "@/features/positions/positions-view";

export const metadata: Metadata = {
  title: "Positions",
};

export default function PositionsPage() {
  return <PositionsView />;
}
