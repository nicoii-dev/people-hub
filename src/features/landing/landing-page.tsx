"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck2,
  Check,
  ChevronRight,
  Clock,
  Mail,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/platform";
import { planKeyFromName } from "@/types/billing";
import {
  formatPlanPrice,
  planPrice,
  publicPlans,
  yearlySavingsPercent,
  type BillingCycle,
} from "./landing-data";

interface LandingPageProps {
  plans: SubscriptionPlan[];
  supportEmail: string;
}

const steps: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Set up your workspace",
    description:
      "Register your organization, choose the features you want to explore, and start a 14-day trial. Your workspace is ready in minutes.",
    icon: Building2,
  },
  {
    title: "Bring your people onboard",
    description:
      "Build your employee directory, track onboarding, and keep profiles, departments, and positions up to date.",
    icon: UsersRound,
  },
  {
    title: "Run the everyday work",
    description:
      "Clock attendance, manage leave and timesheets, log project time, and process payroll without juggling spreadsheets.",
    icon: CalendarCheck2,
  },
  {
    title: "See the bigger picture",
    description:
      "Turn daily activity into reports across attendance, projects, and payroll so leaders can act with confidence.",
    icon: BarChart3,
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes. Move to a different plan as your team grows or your needs change. Your workspace and employee records stay where they are.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Register a company to start a 14-day trial with the HRIS features you choose. You can add employees, set up projects, assign teammates, and log time before picking a paid plan.",
  },
  {
    question: "Do employees get their own portal?",
    answer:
      "Yes. Employees get a self-service home with onboarding, a team directory, company information, and their own profile.",
  },
  {
    question: "Can I explore PeopleHub before signing up?",
    answer:
      "Open the workspace and choose a demo role. You can preview the HR dashboard, employee portal, and platform controls without credentials.",
  },
];

const previewStats = [
  { label: "Employees", value: "248", icon: UsersRound },
  { label: "On leave", value: "6", icon: CalendarCheck2 },
  { label: "Hours logged", value: "1,284", icon: Clock },
];

const previewActivity = [
  { name: "Amara Reyes", detail: "Onboarding complete", dot: "bg-emerald-500" },
  { name: "Josefa Torres", detail: "Leave approved", dot: "bg-sky-500" },
  { name: "Ricardo Mendoza", detail: "Project time logged", dot: "bg-amber-500" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <UsersRound className="size-5" />
      </span>
      <span>PeopleHub</span>
    </Link>
  );
}

export function LandingPage({ plans, supportEmail }: LandingPageProps) {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("monthly");
  const visiblePlans = React.useMemo(() => publicPlans(plans), [plans]);
  const maxSavings = Math.max(0, ...visiblePlans.map(yearlySavingsPercent));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#subscriptions" className="transition-colors hover:text-foreground">Subscriptions</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">
                Start free trial
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="overflow-hidden border-b bg-gradient-to-b from-accent/40 to-background">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
            <div>
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="size-3" />
                People operations, simplified
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                One place for <span className="text-primary">your people</span> to do their best work.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                PeopleHub brings your employee records, attendance, leave, payroll, projects, and reports into a single workspace, with the right tools for every role.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">
                    Start your free trial
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  Role-based access
                </span>
                <span className="flex items-center gap-2">
                  <WalletCards className="size-4 text-primary" />
                  Transparent pricing
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border bg-card p-3 shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-2 border-b px-2 pb-3">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs text-muted-foreground">peoplehub / dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3 p-3">
                  {previewStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-lg border bg-muted/30 p-3">
                        <Icon className="size-4 text-primary" />
                        <p className="mt-2 text-xl font-semibold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2 px-3 pb-3">
                  <p className="text-xs font-medium">Today at a glance</p>
                  {previewActivity.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                    >
                      <span className={cn("size-2 rounded-full", item.dot)} />
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{item.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden rounded-xl border bg-card px-4 py-3 shadow-lg sm:block">
                <p className="text-xs text-muted-foreground">Payroll run</p>
                <p className="text-sm font-semibold">Ready to review</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
            {[
              { value: "25 – 5,000+", label: "Employees supported per plan" },
              { value: "99.98%", label: "Platform uptime" },
              { value: "4 plans", label: "One flexible platform" },
            ].map((item) => (
              <div key={item.label} className="text-center sm:text-left">
                <p className="text-2xl font-semibold tracking-tight">{item.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                From onboarding to insight in four steps
              </h2>
              <p className="mt-4 text-muted-foreground">
                PeopleHub connects the work your team already does every day, so nothing gets lost between systems.
              </p>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="rounded-xl border bg-card p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <span className="text-3xl font-semibold text-muted-foreground/25">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="subscriptions" className="scroll-mt-20 border-y bg-muted/30 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Subscriptions</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Simple plans that grow with your team
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Start small and upgrade when you need more people, automation, or insight. Every plan includes the core PeopleHub workspace.
                </p>
              </div>
              <div
                className="inline-flex self-start rounded-lg border bg-card p-1"
                role="group"
                aria-label="Billing cycle"
              >
                {(["monthly", "yearly"] as const).map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    aria-pressed={billingCycle === cycle}
                    onClick={() => setBillingCycle(cycle)}
                    className={cn(
                      "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      billingCycle === cycle
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {cycle === "monthly" ? "Monthly" : "Yearly"}
                    {cycle === "yearly" && maxSavings > 0 ? (
                      <span className="ml-2 text-xs opacity-80">Save up to {maxSavings}%</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {visiblePlans.map((plan) => {
                const savings = yearlySavingsPercent(plan);
                const planKey = planKeyFromName(plan.name);
                const planHref = `/billing?cycle=${billingCycle}${planKey ? `&plan=${planKey}` : ""}`;
                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative flex h-full flex-col",
                      plan.popular && "border-primary shadow-lg shadow-primary/10",
                    )}
                  >
                    {plan.popular ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Most popular
                      </span>
                    ) : null}
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-5">
                      <div>
                        <p className="text-3xl font-semibold tracking-tight">
                          {formatPlanPrice(planPrice(plan, billingCycle), plan.currency)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {billingCycle === "monthly" ? "per month" : "per year"}
                          {billingCycle === "monthly"
                            ? ` · ${formatPlanPrice(plan.priceYearly, plan.currency)} yearly`
                            : null}
                        </p>
                        {billingCycle === "yearly" && savings > 0 ? (
                          <Badge variant="secondary" className="mt-2">
                            Save {savings}% vs monthly
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 border-y py-3 text-sm">
                        <UsersRound className="size-4 text-primary" />
                        <span>Up to {plan.employeeLimit.toLocaleString("en-PH")} employees</span>
                      </div>
                      <ul className="flex-1 space-y-2.5 text-sm">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button asChild variant={plan.popular ? "default" : "outline"} className="w-full">
                        <Link href={planHref}>
                          Choose {plan.name}
                          <ArrowRight />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Prices in PHP. Switch plans any time from your workspace.
            </p>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Good questions, answered
              </h2>
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-xl border bg-card p-5 open:bg-accent/30"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to make people management feel effortless?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Register your company and spend 14 days exploring PeopleHub with the features your team needs. No credit card required.
              </p>
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link href="/register">
                  Start your free trial
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Logo />
          <p className="text-sm text-muted-foreground">© 2026 PeopleHub. Built for people teams.</p>
          <a
            href={`mailto:${supportEmail}`}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="size-4" />
            {supportEmail}
          </a>
        </div>
      </footer>
    </div>
  );
}
