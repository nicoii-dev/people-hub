"use client";

import { ArrowRight, ShieldCheck, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/config/env";
import { ROLES, ROLE_LABELS } from "@/config/permissions";
import { authService } from "@/features/auth/mock-auth.service";
import { useAppDispatch } from "@/store";
import { setSession } from "@/store/slices/auth";
import * as React from "react";

function ApiLogin() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const session = await authService.loginWithCredentials(email, password);
      dispatch(setSession(session));
      toast.success("Signed in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <UsersRound className="size-6" />
        </span>
        <CardTitle className="mt-3 text-2xl">Welcome to PeopleHub</CardTitle>
        <CardDescription>Sign in with your People Hub API account.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <Badge variant="secondary">API authentication</Badge>
        </div>
        <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MockLoginOptions() {
  const dispatch = useAppDispatch();
  const [pendingRole, setPendingRole] = React.useState<string | null>(null);

  async function login(role: (typeof ROLES)[number]) {
    setPendingRole(role);
    const session = await authService.login(role);
    dispatch(setSession(session));
    toast.success(`Signed in as ${ROLE_LABELS[role]}`);
    setPendingRole(null);
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <UsersRound className="size-6" />
        </span>
        <CardTitle className="mt-3 text-2xl">Welcome to PeopleHub</CardTitle>
        <CardDescription>
          This is a mock sign-in for development. Choose a role to preview role-based navigation and permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <Badge variant="secondary">Mock authentication</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => (
            <Button
              key={role}
              variant="outline"
              className="h-auto justify-between p-4 text-left"
              disabled={pendingRole !== null}
              onClick={() => void login(role)}
            >
              <span>
                <span className="block text-sm font-semibold">{ROLE_LABELS[role]}</span>
                <span className="block text-xs text-muted-foreground">Continue with development session</span>
              </span>
              <ArrowRight className="size-4" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function MockLogin() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      {env.useMockData ? <MockLoginOptions /> : <ApiLogin />}
    </div>
  );
}
