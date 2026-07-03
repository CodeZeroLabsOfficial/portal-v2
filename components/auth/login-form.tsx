"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolvePostLoginPath } from "@/lib/auth/post-login-path";
import { getFirebaseClientAuth } from "@/lib/firebase/client-app";
import type { UserRole } from "@/types/user";

interface LoginFormProps {
  nextPath: string;
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSubmit(values: LoginInput) {
    setError(null);
    setInfo(null);

    const auth = getFirebaseClientAuth();
    if (!auth) {
      setError(
        "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* keys from .env.example, then restart the dev server.",
      );
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const idToken = await credential.user.getIdToken(true);

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        role?: UserRole;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "Unable to create server session.");
      }

      const destination = resolvePostLoginPath(nextPath, body.role);

      setInfo("Signed in successfully. Redirecting...");
      router.replace(destination);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Sign in failed.");
    }
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="sr-only">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            className="w-full"
            {...form.register("email")}
            required
          />
          {form.formState.errors.email ? (
            <p className="text-destructive mt-1 text-xs">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            className="w-full"
            {...form.register("password")}
            required
          />
          {form.formState.errors.password ? (
            <p className="text-destructive mt-1 text-xs">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
        <div className="text-end">
          <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
            Forgot your password?
          </Link>
        </div>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-muted-foreground text-sm" role="status">
          {info}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
