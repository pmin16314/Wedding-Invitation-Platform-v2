"use client";
import { useState, useEffect, useCallback, createContext, useContext } from "react";

/* ══════════════════════════════════════════════
   TOAST SYSTEM
══════════════════════════════════════════════ */
interface Toast { id: string; message: string; type: "default"|"success"|"error"; }
interface ToastCtx { show: (msg: string, type?: Toast["type"]) => void; }

const ToastContext = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast["type"] = "default") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="db-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`db-toast db-toast-${t.type}`}>
            <div className="db-toast-bar"/>
            <span className="db-toast-text">{t.message}</span>
            <button className="db-toast-close" onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ══════════════════════════════════════════════
   CONFIRM DIALOG
══════════════════════════════════════════════ */
interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }: ConfirmProps) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="db-confirm-backdrop" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="db-confirm-box">
        <div className="db-confirm-header">
          <div className="db-confirm-title">{title}</div>
        </div>
        <div className="db-confirm-body">{message}</div>
        <div className="db-confirm-footer">
          <button className="db-btn db-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`db-btn ${danger ? "db-btn-danger" : "db-btn-primary"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
