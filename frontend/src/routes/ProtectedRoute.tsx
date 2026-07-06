import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/user";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-400">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export function RoleGate({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
        You don't have permission to view this page.
      </div>
    );
  }
  return <>{children}</>;
}
