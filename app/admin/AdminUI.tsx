"use client";
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

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
      <div className="a-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`a-toast a-toast-${t.type}`}>
            <div className="a-toast-bar"/>
            <span className="a-toast-text">{t.message}</span>
            <button className="a-toast-close" onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ══════════════════════════════════════════════
   UNSAVED MODAL
══════════════════════════════════════════════ */
interface UnsavedModalProps {
  open:    boolean;
  onSave:  () => void;
  onDiscard: () => void;
  onClose: () => void;
}

export function UnsavedModal({ open, onSave, onDiscard, onClose }: UnsavedModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="a-unsaved-overlay" onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
      <div className="a-unsaved-modal">
        <div className="a-unsaved-border"/>
        <button className="a-unsaved-close" onClick={onClose}>×</button>
        <p className="a-unsaved-text">There are unsaved items. Do you need to save them?</p>
        <div className="a-unsaved-actions">
          <button className="a-unsaved-yes" onClick={onSave}>Yes</button>
          <button className="a-unsaved-no"  onClick={onDiscard}>No</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SAVE BAR
══════════════════════════════════════════════ */
export function SaveBar({ dirty, saving, onSave, label="Save Changes" }: {
  dirty: boolean; saving: boolean; onSave: () => void; label?: string;
}) {
  if (!dirty && !saving) return null;
  return (
    <div className="a-save-bar" style={{animation:"slideUp .2s cubic-bezier(.16,1,.3,1) both"}}>
      <span style={{fontSize:12,color:"var(--a-muted)"}}>You have unsaved changes</span>
      <button className="a-btn a-btn-primary" onClick={onSave} disabled={saving}>
        {saving ? <><span className="a-spinner"/>{" "}Saving…</> : label}
      </button>
    </div>
  );
}
