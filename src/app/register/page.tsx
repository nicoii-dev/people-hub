import type { Metadata } from "next";
import { RegisterCompanyForm } from "@/features/auth/components/register-company-form";

export const metadata: Metadata = {
  title: "Start your free trial",
  description:
    "Create your PeopleHub account, register your organization, and explore selected HRIS features free for 14 days.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6">
      <div className="w-full max-w-2xl">
        <RegisterCompanyForm />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By creating a workspace you agree to the PeopleHub terms. No credit card is required during the trial.
        </p>
      </div>
    </main>
  );
}
