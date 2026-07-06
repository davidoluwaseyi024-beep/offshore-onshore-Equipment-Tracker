import { NavLink } from "react-router-dom";
import clsx from "clsx";

import { useAuth } from "../../context/AuthContext";
import { canManageSitesAndCategories, canManageUsers } from "../../utils/permissions";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "📊", end: true },
  { to: "/equipment", label: "Equipment", icon: "🛠️" },
  { to: "/maintenance", label: "Maintenance", icon: "🔧" },
  { to: "/reports", label: "Reports", icon: "📄" },
  { to: "/audit", label: "Activity Log", icon: "🕒" },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-brand-950 text-brand-100 md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-600 text-sm font-bold text-white">
          ET
        </span>
        <span className="text-sm font-semibold tracking-wide text-white">Equipment Tracker</span>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand-800 text-white" : "text-brand-200 hover:bg-brand-900 hover:text-white",
              )
            }
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {user && canManageSitesAndCategories(user.role) && (
          <NavLink
            to="/sites-categories"
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand-800 text-white" : "text-brand-200 hover:bg-brand-900 hover:text-white",
              )
            }
          >
            <span aria-hidden>📍</span>
            Sites &amp; Categories
          </NavLink>
        )}

        {user && canManageUsers(user.role) && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand-800 text-white" : "text-brand-200 hover:bg-brand-900 hover:text-white",
              )
            }
          >
            <span aria-hidden>👥</span>
            Users &amp; Roles
          </NavLink>
        )}
      </nav>

      <div className="px-5 py-4 text-xs text-brand-400">Oil &amp; Gas / Engineering Fleet Ops</div>
    </aside>
  );
}
