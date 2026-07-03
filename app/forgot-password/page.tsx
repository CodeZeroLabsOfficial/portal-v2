import Link from "next/link";

import { AuthSplitScreen } from "@/components/auth/auth-split-screen";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getPortalAppearanceSettings } from "@/server/firestore/appearance-settings";

export default async function ForgotPasswordPage() {
  const appearance = await getPortalAppearanceSettings();
  const portalName = appearance?.portalName?.trim() || "Code Zero Labs";

  return (
    <AuthSplitScreen
      portalName={portalName}
      description="Enter your email and we'll send you a reset link"
    >
      <ForgotPasswordForm />
      <p className="text-muted-foreground text-center text-sm">
        Remembered it?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </AuthSplitScreen>
  );
}
