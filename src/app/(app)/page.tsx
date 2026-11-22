import type { Metadata } from "next";
import { FoundationOverview } from "@/components/shared/foundation-overview";

export const metadata: Metadata = {
  title: "Foundation workspace",
};

export default function HomePage() {
  return <FoundationOverview />;
}
