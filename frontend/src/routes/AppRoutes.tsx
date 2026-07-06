import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { ProtectedRoute, RoleGate } from "./ProtectedRoute";

// Route-level code splitting: each page (and the heavy libraries it alone
// depends on — Recharts for the dashboard, the hero image for login) loads
// on demand instead of bloating the single main bundle every visitor pays
// for up front.
const LoginPage = lazy(() => import("../features/auth/LoginPage").then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import("../features/auth/SignupPage").then((m) => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() =>
  import("../features/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("../features/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);
const DashboardPage = lazy(() =>
  import("../features/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const EquipmentListPage = lazy(() =>
  import("../features/equipment/EquipmentListPage").then((m) => ({ default: m.EquipmentListPage })),
);
const EquipmentDetailPage = lazy(() =>
  import("../features/equipment/EquipmentDetailPage").then((m) => ({ default: m.EquipmentDetailPage })),
);
const EquipmentFormPage = lazy(() =>
  import("../features/equipment/EquipmentFormPage").then((m) => ({ default: m.EquipmentFormPage })),
);
const MaintenanceListPage = lazy(() =>
  import("../features/maintenance/MaintenanceListPage").then((m) => ({ default: m.MaintenanceListPage })),
);
const UsersListPage = lazy(() =>
  import("../features/users/UsersListPage").then((m) => ({ default: m.UsersListPage })),
);
const ReportsPage = lazy(() => import("../features/reports/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const AuditHistoryPage = lazy(() =>
  import("../features/audit/AuditHistoryPage").then((m) => ({ default: m.AuditHistoryPage })),
);
const SitesCategoriesPage = lazy(() =>
  import("../features/lookups/SitesCategoriesPage").then((m) => ({ default: m.SitesCategoriesPage })),
);

function PageFallback() {
  return <div className="flex h-full min-h-[40vh] items-center justify-center text-sm text-slate-400">Loading…</div>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/equipment" element={<EquipmentListPage />} />
            <Route path="/equipment/new" element={<EquipmentFormPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />
            <Route path="/maintenance" element={<MaintenanceListPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditHistoryPage />} />
            <Route
              path="/sites-categories"
              element={
                <RoleGate allow={["admin", "engineer"]}>
                  <SitesCategoriesPage />
                </RoleGate>
              }
            />
            <Route
              path="/users"
              element={
                <RoleGate allow={["admin"]}>
                  <UsersListPage />
                </RoleGate>
              }
            />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
