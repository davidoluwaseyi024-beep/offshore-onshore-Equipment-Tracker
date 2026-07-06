import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export function ForgotPasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      tagline="Account recovery"
      heading="Locked out isn't stuck out."
      description="We'll email you a secure link to set a new password in seconds."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
