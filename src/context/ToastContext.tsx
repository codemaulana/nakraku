import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Toast, type ToastItem, type ToastVariant } from "../components/Toast";

export interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, durationMs?: number) => string;
  dismissToast: (id: string) => void;
  success: (message: string, durationMs?: number) => string;
  error: (message: string, durationMs?: number) => string;
  warning: (message: string, durationMs?: number) => string;
  info: (message: string, durationMs?: number) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => (
  <aside
    aria-label="Notifications"
    className="fixed top-12 right-4 z-50 flex flex-col gap-1.5 pointer-events-none"
  >
    {toasts.map((toast) => (
      <div key={toast.id} className="pointer-events-auto">
        <Toast toast={toast} onDismiss={onDismiss} />
      </div>
    ))}
  </aside>
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info", durationMs = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const item: ToastItem = { id, message, variant, durationMs };
      setToasts((prev) => [...prev.slice(-4), item]);
      return id;
    },
    []
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      success: (msg: string, d?: number) => showToast(msg, "success", d),
      error: (msg: string, d?: number) => showToast(msg, "error", d),
      warning: (msg: string, d?: number) => showToast(msg, "warning", d),
      info: (msg: string, d?: number) => showToast(msg, "info", d),
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
