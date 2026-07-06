import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

export function Modal({ open, onClose, title, children, maxWidthClassName = "max-w-lg" }: ModalProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-slate-900/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={`relative w-full ${maxWidthClassName} rounded-xl bg-white shadow-xl`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 id="modal-title" className="text-base font-semibold text-slate-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
