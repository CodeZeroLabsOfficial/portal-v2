import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { resolvePostLoginPath } from "@/lib/auth/post-login-path";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;
  const nextPath = searchParams.next ?? "/dashboard";
  const currentUser = await getCurrentSessionUser();
  if (currentUser) {
    redirect(resolvePostLoginPath(nextPath, currentUser.role));
  }

  return (
    <AuthShell
      title="Sign in"
      footer={
        <>
          Trouble signing in?{" "}
          <Link href="/forgot-password" className="underline underline-offset-4">
            Forgot password
          </Link>
        </>
      }
    >
      <LoginForm nextPath={nextPath} />
    </AuthShell>
  );
}
