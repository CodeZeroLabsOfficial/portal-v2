import { redirect } from "next/navigation";

import { AuthSplitScreen } from "@/components/auth/auth-split-screen";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentSessionUser } from "@/lib/auth/server-session";
import { resolvePostLoginPath } from "@/lib/auth/post-login-path";
import { getPortalAppearanceSettings } from "@/server/firestore/appearance-settings";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;
  const nextPath = searchParams.next ?? "/dashboard";

  const [currentUser, appearance] = await Promise.all([
    getCurrentSessionUser(),
    getPortalAppearanceSettings(),
  ]);

  if (currentUser) {
    redirect(resolvePostLoginPath(nextPath, currentUser.role));
  }

  const portalName = appearance?.portalName?.trim() || "Code Zero Labs";

  return (
    <AuthSplitScreen portalName={portalName} description="Please sign in to your account">
      <LoginForm nextPath={nextPath} />
    </AuthSplitScreen>
  );
}
