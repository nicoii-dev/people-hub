This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Connecting the NestJS API

The sibling `../people-hub-api` service is wired in through `NEXT_PUBLIC_*` variables (see `.env.example`):

```txt
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_COMPANY_ID=          # optional fallback tenant
```

With `NEXT_PUBLIC_USE_MOCK_DATA=false` the sign-in screen asks for the API user's email/password. Access tokens, refresh tokens and the active company are stored in `localStorage`; every tenant request sends `Authorization: Bearer <token>` and `X-Company-Id`. Expired access tokens are refreshed once and the request is retried.

Wired modules: employees, departments, positions, clients, projects, time entries, the client/project report and its CSV export, attendance, leave requests/types/balances, payroll periods/records, recruitment, performance, and authentication. Project reports can be filtered by client, project, date range and billability; CSV export is shown only to roles with `reports:export` (admin, HR head and finance head, plus platform admins). The people-operations charts, dashboard, notifications and settings still use local data because the API has no corresponding controllers yet.

The public landing page lives at `/`. It explains how PeopleHub works in four steps and compares the active subscription plans (monthly or yearly) using the platform plan seed. Each plan button links to `/billing?plan=<key>&cycle=<monthly|yearly>`, where a signed-in admin completes the subscription; the primary calls to action open `/register`. The authenticated HR dashboard is at `/dashboard`.

Self-serve signup lives at `/register`. It creates an account, registers the organization, and starts a 14-day trial with the selected HRIS features (`employees`, `projects`, `assignments`, `time-entries`). In API mode it posts to `POST /auth/register-company`; in mock mode it writes the same shape to the local store. The signed-in `/onboarding` page shows the countdown, selected features and a four-step checklist that persists to `localStorage`. A tenant-wide banner links back to onboarding and `/billing`; once the API reports the trial as expired, writes to the selected HR modules are blocked server-side while reads and checkout remain available.

Admins, finance heads and super admins can manage the active company's subscription at `/billing` (`billing:view`). With `NEXT_PUBLIC_USE_MOCK_DATA=false`, the page posts to `POST /companies/:id/billing/checkout` on the NestJS API and redirects to the Stripe-hosted Checkout URL; the API webhook activates the plan and records the invoice. In mock mode, the same flow is simulated locally: it updates the seeded company's plan, records a demo payment, and refreshes platform revenue. No real charge is made.

Employees use a dedicated self-service area at `/employee`, replacing the HR-facing attendance and timesheet landing pages for that role. It contains Dashboard (announcements, quick actions and current-month birthdays), My onboarding (progress, checklist and uploaded documents), Team Directory (searchable colleagues and clock in/out), About Company (policies and handbook), and My profile (current employee details and company ID). The employee navigation is driven by `employeeNavigation` and five self-service permissions (`employee-home:view`, `onboarding:view`, `team-directory:view`, `company-info:view`, `my-profile:view`); portal content currently uses local data because the API has no announcement, onboarding, policy or handbook controllers yet.

Super admins have a separate SaaS control plane at `/platform`. It includes an overview, registered-company management with suspend/activate and plan assignment, subscription-plan management, payment and revenue monitoring, system-usage dashboards, and platform-wide settings. These pages are gated by `platform:*` permissions that are granted only to `super_admin`; data is persisted through the local mock store until the control-plane API is available.

For a super admin, `superAdminNavigation` replaces the HR menu with the platform controls as the primary sidebar, and the app shell keeps the role inside `/platform`. The HR pages from the standard `navigation` config are reachable from `/platform/companies/[id]` after clicking a company: `companyWorkspaceNavigation` renders them as a secondary sidebar inside that company's workspace. Other roles are redirected away from `/platform`.

Run the Jest suite for the client and adapter layer with:

```bash
npm test
```

You can start editing the landing page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
