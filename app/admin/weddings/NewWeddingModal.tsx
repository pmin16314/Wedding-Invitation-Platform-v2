"use client";
import { useState, useEffect, useCallback } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const DEFAULT_FORM = {
  brideName: "", groomName: "", weddingDate: "",
  coupleUsername: "", coupleEmail: "", couplePassword: "", package: "CLASSIC",
};

export default function NewWeddingModal({ open, onClose, onCreated }: Props) {
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [result,  setResult]  = useState<{ slug: string; password: string; username: string } | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) { setForm(DEFAULT_FORM); setError(""); setResult(null); }
  }, [open]);

  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  function suggestUsername() {
    if (!form.brideName || !form.groomName) return;
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
    setForm(p => ({ ...p, coupleUsername: `${clean(p.brideName)}.${clean(p.groomName)}` }));
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res  = await fetch("/api/admin/weddings/new", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Failed to create wedding"); return; }
    setResult({ slug: json.data.wedding.slug, password: json.data.password, username: form.coupleUsername });
    onCreated();
  }

  if (!open) return null;

  return (
    <div className="a-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="a-modal" style={{ maxWidth: 560 }}>

        {/* Header */}
        <div className="a-modal-header">
          <div>
            <h2 className="a-modal-title">{result ? "Wedding Created ✓" : "New Wedding"}</h2>
            {!result && <p className="a-modal-subtitle">Set up a new couple account and wedding record.</p>}
          </div>
          <button className="a-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="a-modal-body">
          {result ? (
            /* ── Success state ── */
            <>
              <div className="a-banner a-banner-success a-mb-5">
                <span>✓</span>
                <span>Account ready. Share the login details with the couple.</span>
              </div>
              {[
                ["Login URL", `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/${result.slug}/couple-login`],
                ["Username",  result.username],
                ["Password",  result.password],
                ["Invitation",`/${result.slug}`],
              ].map(([label, value]) => (
                <div key={label} className="a-cred-row">
                  <span className="a-cred-label">{label}</span>
                  <div className="a-cred-value">
                    <code className="a-cred-code">{value}</code>
                    <button className="a-btn-icon" onClick={() => navigator.clipboard.writeText(value)}>⎘</button>
                  </div>
                </div>
              ))}
              <div className="a-cred-actions">
                <a href={`/admin/weddings/${result.slug}`} className="a-btn a-btn-primary a-btn-sm">Open Editor →</a>
                <button className="a-btn a-btn-ghost a-btn-sm" onClick={onClose}>Close</button>
              </div>
            </>
          ) : (
            /* ── Form state ── */
            <form id="new-wedding-form" onSubmit={submit}>
              {error && <div className="a-banner a-banner-error a-mb-4">{error}</div>}
              <div className="a-form-grid">
                <div className="a-field">
                  <label className="a-label">Bride's Name *</label>
                  <input className="a-input" required value={form.brideName}
                    onChange={f("brideName")} onBlur={suggestUsername} placeholder="Ishara" />
                </div>
                <div className="a-field">
                  <label className="a-label">Groom's Name *</label>
                  <input className="a-input" required value={form.groomName}
                    onChange={f("groomName")} onBlur={suggestUsername} placeholder="Panchana" />
                </div>
                <div className="a-field">
                  <label className="a-label">Wedding Date</label>
                  <input className="a-input" type="date" value={form.weddingDate} onChange={f("weddingDate")} />
                </div>
                <div className="a-field">
                  <label className="a-label">Package *</label>
                  <select className="a-select" value={form.package} onChange={f("package")}>
                    <option value="BASIC">Basic — LKR 3,900</option>
                    <option value="CLASSIC">Classic — LKR 9,900</option>
                    <option value="PREMIUM">Premium — LKR 21,900</option>
                  </select>
                </div>
                <div className="a-field a-form-full">
                  <label className="a-label">Username * <span className="a-label-hint">couple uses this to log in</span></label>
                  <input className="a-input" required value={form.coupleUsername} onChange={f("coupleUsername")}
                    placeholder="ishara.panchana" pattern="[a-z0-9._\-]+" title="Letters, numbers, dots, hyphens only" />
                  <span className="a-hint-text">Auto-suggested from names — lowercase, dots and hyphens only</span>
                </div>
                <div className="a-field a-form-full">
                  <label className="a-label">Email <span className="a-label-hint">optional</span></label>
                  <input className="a-input" type="email" value={form.coupleEmail}
                    onChange={f("coupleEmail")} placeholder="couple@example.com" />
                </div>
                <div className="a-field a-form-full">
                  <label className="a-label">Password <span className="a-label-hint">leave blank to auto-generate</span></label>
                  <input className="a-input" type="password" value={form.couplePassword}
                    onChange={f("couplePassword")} placeholder="Min 8 characters" minLength={8} />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer — only shown during form state */}
        {!result && (
          <div className="a-modal-footer">
            <button className="a-btn a-btn-ghost" onClick={onClose}>Cancel</button>
            <button form="new-wedding-form" type="submit" className="a-btn a-btn-primary" disabled={loading}>
              {loading ? <><span className="a-spinner" />Creating…</> : "Create Wedding"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
