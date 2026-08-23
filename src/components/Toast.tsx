import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const colors = {
  success: { bg: "bg-emerald-50 border-emerald-200", icon: "text-emerald-500", title: "text-emerald-900" },
  error: { bg: "bg-rose-50 border-rose-200", icon: "text-rose-500", title: "text-rose-900" },
  warning: { bg: "bg-amber-50 border-amber-200", icon: "text-amber-500", title: "text-amber-900" },
  info: { bg: "bg-blue-50 border-blue-200", icon: "text-blue-500", title: "text-blue-900" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          const c = colors[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm pointer-events-auto transition-all ${c.bg}`}
              style={{ animation: "slideUp 0.2s ease" }}
            >
              <Icon size={16} className={`mt-0.5 shrink-0 ${c.icon}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold font-display ${c.title}`}>{toast.title}</p>
                {toast.message && <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>}
              </div>
              <button onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}
