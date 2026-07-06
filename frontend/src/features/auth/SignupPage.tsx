import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { SignupForm } from "./SignupForm";

export function SignupPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      tagline="Join the fleet"
      heading="One place for every asset, from the rig floor to the office."
      description="Create your account to log equipment status, maintenance work, and assignments from wherever you are."
    >
      <SignupForm />
    </AuthLayout>
  );
}
