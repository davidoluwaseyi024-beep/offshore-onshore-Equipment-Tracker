import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { requestPasswordReset } from "../../api/auth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
    } finally {
      // Always show the same confirmation, whether or not the email matched
      // an account — this mirrors the backend's response, which never
      // reveals which emails are registered.
      setIsSubmitting(false);
      setSubmitted(true);
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
          <h1 className="text-lg font-semibold text-brand-950">Reset your password</h1>
          <p className="text-xs text-slate-500">We'll email you a link to set a new one.</p>
        </div>
      </div>

      {submitted ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-md bg-status-good/10 px-3 py-3 text-sm text-status-good">
            If an account exists for <span className="font-medium">{email}</span>, we've sent a reset link — check
            your inbox (and spam folder).
          </p>
          <Link to="/login">
            <Button variant="secondary" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
          />
          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-accent-700 hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}
