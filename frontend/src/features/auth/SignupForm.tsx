import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

const emptyForm = { email: "", username: "", first_name: "", last_name: "", password: "" };

export function SignupForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        const details = err.response.data?.error?.details ?? {};
        const fieldErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(details)) {
          fieldErrors[key] = Array.isArray(value) ? String(value[0]) : String(value);
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
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
          <h1 className="text-lg font-semibold text-brand-950">Create your account</h1>
          <p className="text-xs text-slate-500">For engineers, technicians, and field/office staff.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          />
          <Input
            label="Last Name"
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          />
        </div>
        <Input
          label="Email"
          type="email"
          autoComplete="username"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          placeholder="you@gmail.com"
        />
        <Input
          label="Username"
          autoComplete="username"
          required
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          error={errors.username}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
          hint={!errors.password ? "At least 10 characters." : undefined}
          placeholder="••••••••"
        />

        {errors.general && (
          <p role="alert" className="rounded-md bg-status-critical/10 px-3 py-2 text-sm text-status-critical">
            {errors.general}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-xs text-slate-400">
          New accounts start with Technician access. An admin can upgrade your role afterward.
        </p>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
