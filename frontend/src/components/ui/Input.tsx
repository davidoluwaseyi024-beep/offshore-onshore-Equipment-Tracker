import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, error, hint, className, children }: FieldWrapperProps) {
  return (
    <label className={clsx("block", className)}>
      {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
      {children}
      {error && <span className="mt-1 block text-xs text-status-critical">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

const fieldClasses =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:bg-slate-50 disabled:text-slate-400";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, className, ...props }, ref) => (
  <FieldWrapper label={label} error={error} hint={hint}>
    <input ref={ref} className={clsx(fieldClasses, error && "border-status-critical", className)} {...props} />
  </FieldWrapper>
));
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, className, children, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select ref={ref} className={clsx(fieldClasses, error && "border-status-critical", className)} {...props}>
        {children}
      </select>
    </FieldWrapper>
  ),
);
Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      <textarea ref={ref} className={clsx(fieldClasses, error && "border-status-critical", className)} {...props} />
    </FieldWrapper>
  ),
);
Textarea.displayName = "Textarea";
