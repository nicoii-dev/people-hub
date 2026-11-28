import type { Metadata } from "next";
import { TrialOnboardingView } from "@/features/trial/components/trial-onboarding-view";

export const metadata: Metadata = {
  title: "Trial setup",
  description:
    "Follow the guided checklist to explore PeopleHub during your 14-day trial.",
};

export default function TrialOnboardingPage() {
  return <TrialOnboardingView />;
}
