"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWeddingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    brideName: "", groomName: "", weddingDate: "",
    coupleUsername: "", coupleEmail: "", couplePassword: "", package: "CLASSIC",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{slug:string; password:string; username:string} | null>(null);

  // Auto-suggest username from bride+groom names
  function suggestUsername() {
    if (!form.brideName || !form.groomName) return;
    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
    const suggested = `${clean(form.brideName)}.${clean(form.groomName)}`;
    setForm(p => ({ ...p, coupleUsername: suggested }));
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/admin/weddings/new", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) { setError(json.error ?? "Failed"); return; }
    setResult({ slug: json.data.wedding.slug, password: json.data.password, username: form.coupleUsername });
  }

  if (result) return (
    <div className="a-card fade-up a-card-narrow">
      <div className="a-card-header"><span className="a-card-title">Wedding Created ✓</span></div>
      <div className="a-card-body">
        <div className="a-banner a-banner-success a-mb-5">
          <span>✓</span>
          <span>Account ready. Share the login URL, username and password with the couple.</span>
        </div>
        {[
          ["Login URL",  `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/${result.slug}/couple-login`],
          ["Username",   result.username],
          ["Password",   result.password],
          ["Invitation", `/${result.slug}`],
        ].map(([label, value]) => (
          <div key={label} className="a-cred-row">
            <span className="a-cred-label">{label}</span>
            <code className="a-cred-code">{value}</code>
          </div>
        ))}
        <div className="a-result-actions">
          <a href="/admin/weddings" className="a-btn a-btn-outline">← All Weddings</a>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="a-form-narrow">
      {error && <div className="a-banner a-banner-error a-mb-4">{error}</div>}
      <div className="a-card fade-up">
        <div className="a-card-header"><span className="a-card-title">Couple Details</span></div>
        <div className="a-card-body">
          <div className="a-form-grid">
            <div className="a-field">
              <label className="a-label">Bride's Name *</label>
              <input className="a-input" required value={form.brideName} onChange={f("brideName")} onBlur={suggestUsername} placeholder="Ishara" />
            </div>
            <div className="a-field">
              <label className="a-label">Groom's Name *</label>
              <input className="a-input" required value={form.groomName} onChange={f("groomName")} onBlur={suggestUsername} placeholder="Panchana" />
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
              <span className="a-hint-text">Auto-suggested from names — lowercase letters, numbers, dots and hyphens only</span>
            </div>
            <div className="a-field a-form-full">
              <label className="a-label">Email <span className="a-label-hint">optional — for contact only</span></label>
              <input className="a-input" type="email" value={form.coupleEmail} onChange={f("coupleEmail")} placeholder="couple@example.com" />
            </div>
            <div className="a-field a-form-full">
              <label className="a-label">Password <span className="a-label-hint">leave blank to auto-generate</span></label>
              <input className="a-input" type="password" value={form.couplePassword} onChange={f("couplePassword")} placeholder="Min 8 characters" minLength={8} />
            </div>
          </div>
        </div>
        <div className="a-card-footer a-card-footer-end">
          <a href="/admin/weddings" className="a-btn a-btn-ghost">Cancel</a>
          <button type="submit" className="a-btn a-btn-primary" disabled={loading}>
            {loading ? <><span className="a-spinner"/>Creating…</> : "Create Wedding"}
          </button>
        </div>
      </div>
    </form>
  );
}
