import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout
      tagline="Field-Ready Asset Management"
      heading="Track every asset, every site, every technician — end to end."
      description="Equipment registration, maintenance history, assignments, and full audit trails for oil & gas and engineering fleets."
    >
      <LoginForm />
    </AuthLayout>
  );
}
