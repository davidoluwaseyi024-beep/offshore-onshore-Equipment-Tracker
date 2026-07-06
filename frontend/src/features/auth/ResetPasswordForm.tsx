import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";

import { confirmPasswordReset } from "../../api/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const linkLooksValid = Boolean(uid && token);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(uid, token, newPassword);
      setSucceeded(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        const details = err.response.data?.error?.details ?? {};
        const firstMessage = Object.values(details)[0];
        setError(
          Array.isArray(firstMessage)
            ? String(firstMessage[0])
            : typeof firstMessage === "string"
              ? firstMessage
              : "This reset link is invalid or has expired.",
        );
      } else {
        setError("Something went wrong. Please try again.");
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
          <h1 className="text-lg font-semibold text-brand-950">Set a new password</h1>
          <p className="text-xs text-slate-500">Choose something you haven't used before.</p>
        </div>
      </div>

      {!linkLooksValid ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-md bg-status-critical/10 px-3 py-3 text-sm text-status-critical">
            This reset link is missing or malformed. Request a new one to continue.
          </p>
          <Link to="/forgot-password">
            <Button className="w-full">Request a new link</Button>
          </Link>
        </div>
      ) : succeeded ? (
        <p className="rounded-md bg-status-good/10 px-3 py-3 text-sm text-status-good">
          Password reset — taking you to sign in…
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="At least 10 characters."
            placeholder="••••••••"
          />
          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p role="alert" className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      )}
    </motion.div>
  );
}
