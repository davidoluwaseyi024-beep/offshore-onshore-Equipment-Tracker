import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { isAxiosError } from "axios";
import clsx from "clsx";

import { useAuth, RoleMismatchError } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

type LoginMode = "staff" | "admin";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<LoginMode>("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      // The login form is split into "Admin" and "Staff" tabs so each
      // audience lands somewhere that matches expectations. `validate` runs
      // before the user is committed to auth state, so a mismatched tab
      // never even briefly authenticates — no flash-then-bounce, and the
      // error message actually stays visible on this form.
      await login(email, password, (loggedInUser) => {
        const isAdminAccount = loggedInUser.role === "admin";
        if (mode === "admin" && !isAdminAccount) {
          return "This account isn't an admin account. Use the Staff tab instead.";
        }
        if (mode === "staff" && isAdminAccount) {
          return "This is an admin account. Use the Admin tab instead.";
        }
        return null;
      });

      const redirectTo = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof RoleMismatchError) {
        setError(err.message);
      } else if (isAxiosError(err) && err.response?.status === 401) {
        setError("Incorrect email or password.");
      } else {
        setError("Unable to sign in right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-sm rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
    >
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-600 text-sm font-bold text-white">
          ET
        </span>
        <div>
          <h1 className="text-lg font-semibold text-brand-950">Equipment Tracker</h1>
          <p className="text-xs text-slate-500">
            {mode === "admin" ? "Admin sign in" : "Sign in to your account"}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        {(["staff", "admin"] as LoginMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={clsx(
              "rounded-md py-1.5 capitalize transition-colors",
              mode === m ? "bg-white text-brand-950 shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {m === "staff" ? "Staff" : "Admin"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <div className="-mt-2 text-right">
          <Link to="/forgot-password" className="text-xs font-medium text-accent-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Signing in…" : mode === "admin" ? "Sign in as Admin" : "Sign in"}
        </Button>

        <p className="text-center text-xs text-slate-400">
          {mode === "staff"
            ? "For engineers, technicians, and other field/office staff."
            : "For system administrators only."}
        </p>

        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/signup" className="font-medium text-accent-700 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
