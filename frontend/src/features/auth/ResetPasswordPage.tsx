import { AuthLayout } from "./AuthLayout";
import { ResetPasswordForm } from "./ResetPasswordForm";

export function ResetPasswordPage() {
  return (
    <AuthLayout
      tagline="Account recovery"
      heading="Almost there."
      description="Set a new password below and you'll be back to tracking equipment in seconds."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
