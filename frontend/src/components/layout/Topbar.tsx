import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { RoleBadge } from "../ui/Badge";
import { Button } from "../ui/Button";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="md:hidden text-sm font-semibold text-brand-900">Equipment Tracker</div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-800">{user.first_name || user.email}</span>
            <RoleBadge role={user.role} />
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
