import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/landing-page";
import { platformSettingsSeed, subscriptionPlanSeed } from "@/data/platform";

export const metadata: Metadata = {
  title: "HR for growing teams",
  description:
    "See how PeopleHub brings employee management, attendance, payroll, projects, and reporting together, and compare subscription plans for every team size.",
};

export default function Landing() {
  return (
    <LandingPage
      plans={subscriptionPlanSeed}
      supportEmail={platformSettingsSeed.supportEmail}
    />
  );
}
