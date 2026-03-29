"use client";
import { useState } from "react";
import { IconWhatsApp } from "@/components/icons";
const STATUSES = ["NEW","CONTACTED","PAID","CONVERTED","LOST"] as const;

interface Lead {
  id:string; name:string; email:string; whatsapp:string;
  package:string; hasDesignerCard:boolean; status:string;
  notes:string|null; createdAt:string;
  weddingSlug?: string | null;
}

interface CreateWeddingModal {
  lead: Lead;
  brideName: string;
  groomName: string;
  username: string;
  password: string;
  email: string;
  weddingDate: string;
  pkg: string;
}

// Split "Muthu & Muthu" or "Kasun & Dilini" into bride/groom
function splitNames(name: string): [string, string] {
  const parts = name.split(/\s*[&,]\s*/);
  return [parts[0]?.trim() ?? name, parts[1]?.trim() ?? ""];
}

// Generate username from names: "ishara.panchana"
function makeUsername(bride: string, groom: string): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15);
  return `${clean(bride)}.${clean(groom)}`;
}

// Generate a random password
function genPassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function LeadsClient({ leads: initial }: { leads: Lead[] }) {
  const [leads,  setLeads]  = useState(initial);
  const [filter, setFilter] = useState("ALL");
  const [modal,  setModal]  = useState<CreateWeddingModal | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ slug: string; username: string; password: string } | null>(null);
  const [error,  setError]  = useState("");

  function openModal(lead: Lead) {
    const [brideName, groomName] = splitNames(lead.name);
    setModal({
      lead,
      brideName, groomName,
      username: makeUsername(brideName, groomName),
      password: genPassword(),
      email:    lead.email ?? "",
      weddingDate: "",
      pkg:      lead.package,
    });
    setResult(null);
    setError("");
  }

  function closeModal() { setModal(null); setResult(null); setError(""); }

  async function updateStatus(id: string, status: string) {
    setLeads(ls => ls.map(l => l.id===id ? {...l, status} : l));
    await fetch(`/api/admin/leads/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status}) });
  }

  async function updateNotes(id: string, notes: string) {
    setLeads(ls => ls.map(l => l.id===id ? {...l, notes} : l));
    await fetch(`/api/admin/leads/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({notes}) });
  }

  async function createWedding() {
    if (!modal) return;
    setSaving(true); setError("");
    const res = await fetch("/api/admin/weddings/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brideName:      modal.brideName,
        groomName:      modal.groomName,
        coupleUsername: modal.username,
        coupleEmail:    modal.email || undefined,
        couplePassword: modal.password,
        package:        modal.pkg,
        weddingDate:    modal.weddingDate || undefined,
      }),
    });
    const j = await res.json();
    setSaving(false);
    if (!res.ok) { setError(j.error ?? "Failed to create wedding"); return; }

    // Auto-mark lead as CONVERTED
    await updateStatus(modal.lead.id, "CONVERTED");
    setLeads(ls => ls.map(l => l.id===modal.lead.id
      ? { ...l, status:"CONVERTED", weddingSlug: j.data.wedding.slug }
      : l
    ));
    setResult({ slug: j.data.wedding.slug, username: j.data.username, password: j.data.password });
  }

  const filtered = filter==="ALL" ? leads : leads.filter(l => l.status===filter);

  return (
    <div>
      {/* Filter bar */}
      <div className="a-filter-bar">
        {["ALL",...STATUSES].map(s => (
          <button key={s} className={`a-btn a-btn-sm ${filter===s?"a-btn-primary":"a-btn-outline"}`} onClick={()=>setFilter(s)}>
            {s} {s!=="ALL" && <span style={{opacity:.7,marginLeft:3}}>({leads.filter(l=>l.status===s).length})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="a-card">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr><th>Name</th><th>WhatsApp</th><th>Package</th><th>Print Card</th><th>Status</th><th>Notes</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="a-table-name">{l.name}</div>
                    <div className="a-table-sub">{l.email}</div>
                  </td>
                  <td className="a-table-muted">{l.whatsapp}</td>
                  <td><span className={`a-badge a-badge-${l.package.toLowerCase()}`}>{l.package}</span></td>
                  <td className="a-text-center">{l.hasDesignerCard ? "Yes" : "No"}</td>
                  <td>
                    <select className="a-select a-select-sm"
                      value={l.status} onChange={e=>updateStatus(l.id,e.target.value)}>
                      {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <input className="a-input a-input-sm"
                      defaultValue={l.notes??""} placeholder="Add notes…"
                      onBlur={e=>updateNotes(l.id,e.target.value)}/>
                  </td>
                  <td className="a-table-muted">{new Date(l.createdAt).toLocaleDateString("en-GB")}</td>
                  <td>
                    <div className="a-table-actions">
                      <a href={`https://wa.me/${l.whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(`Hi ${l.name}, thank you for your interest in Vowly Invites! I'd love to chat about your ${l.package} package. When is a good time to connect?`)}`}
                        target="_blank" rel="noopener" className="a-lead-wa-btn">
                        <IconWhatsApp size={16} />
                      </a>
                      {l.status === "PAID" && (
                        <button className="a-btn a-btn-sm a-btn-primary" onClick={()=>openModal(l)}>
                          + Create Wedding
                        </button>
                      )}
                      {l.status === "CONVERTED" && l.weddingSlug && (
                        <a href="/admin/weddings" className="a-btn a-btn-sm a-btn-success">
                          View Wedding
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0&&(
                <tr><td colSpan={8}>
                  <div className="a-empty">
                    <div className="a-empty-icon">📋</div>
                    <div className="a-empty-title">No leads {filter!=="ALL"?`with status "${filter}"`:"yet"}</div>
                    <div className="a-empty-text">New leads from the order form will appear here.</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Wedding Modal ── */}
      {modal && (
        <div className="a-modal-backdrop" onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
          <div className="a-modal">

            <div className="a-modal-header">
              <div>
                <h2 className="a-modal-title">Create Wedding</h2>
                <p className="a-modal-subtitle">From lead: <strong>{modal.lead.name}</strong> · {modal.lead.package}</p>
              </div>
              <button onClick={closeModal} className="a-modal-close">✕</button>
            </div>

            <div className="a-modal-body">
              {!result ? (
                <>
                  {error && <div className="a-banner a-banner-error a-mb-4">{error}</div>}
                  <div className="a-form-grid">
                    <div className="a-field">
                      <label className="a-label">Bride's Name *</label>
                      <input className="a-input" value={modal.brideName}
                        onChange={e=>setModal(m=>m?{...m,brideName:e.target.value,username:makeUsername(e.target.value,m.groomName)}:m)}/>
                    </div>
                    <div className="a-field">
                      <label className="a-label">Groom's Name *</label>
                      <input className="a-input" value={modal.groomName}
                        onChange={e=>setModal(m=>m?{...m,groomName:e.target.value,username:makeUsername(m.brideName,e.target.value)}:m)}/>
                    </div>
                    <div className="a-field">
                      <label className="a-label">Username *</label>
                      <input className="a-input" value={modal.username}
                        onChange={e=>setModal(m=>m?{...m,username:e.target.value}:m)} placeholder="ishara.panchana"/>
                    </div>
                    <div className="a-field">
                      <label className="a-label">Package *</label>
                      <select className="a-select" value={modal.pkg} onChange={e=>setModal(m=>m?{...m,pkg:e.target.value}:m)}>
                        <option value="BASIC">Basic — LKR 3,900</option>
                        <option value="CLASSIC">Classic — LKR 9,900</option>
                        <option value="PREMIUM">Premium — LKR 21,900</option>
                      </select>
                    </div>
                    <div className="a-field a-form-full">
                      <label className="a-label">Email <span className="a-label-hint">optional</span></label>
                      <input className="a-input" type="email" value={modal.email}
                        onChange={e=>setModal(m=>m?{...m,email:e.target.value}:m)} placeholder="couple@example.com"/>
                    </div>
                    <div className="a-field">
                      <label className="a-label">Wedding Date <span className="a-label-hint">optional</span></label>
                      <input className="a-input" type="date" value={modal.weddingDate}
                        onChange={e=>setModal(m=>m?{...m,weddingDate:e.target.value}:m)}/>
                    </div>
                    <div className="a-field">
                      <label className="a-label">Password</label>
                      <div className="a-pw-row">
                        <input className="a-input a-input-mono" value={modal.password} readOnly/>
                        <button type="button" className="a-btn a-btn-outline a-btn-sm"
                          onClick={()=>setModal(m=>m?{...m,password:genPassword()}:m)}>↻</button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="a-banner a-banner-success a-mb-5">
                    <span>✓</span>
                    <span>Wedding created! Lead marked as <strong>CONVERTED</strong>.</span>
                  </div>
                  {[
                    ["Invitation URL", `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/${result.slug}/couple-login`],
                    ["Username",       result.username],
                    ["Password",       result.password],
                  ].map(([label, value]) => (
                    <div key={label} className="a-cred-row">
                      <span className="a-cred-label">{label}</span>
                      <div className="a-cred-value">
                        <code className="a-cred-code">{value}</code>
                        <button className="a-btn-icon" onClick={()=>navigator.clipboard.writeText(value)}>⎘</button>
                      </div>
                    </div>
                  ))}
                  <div className="a-cred-actions">
                    <a href="/admin/weddings" className="a-btn a-btn-primary a-btn-sm">View Weddings →</a>
                    <button className="a-btn a-btn-ghost a-btn-sm" onClick={closeModal}>Close</button>
                  </div>
                </div>
              )}
            </div>

            {!result && (
              <div className="a-modal-footer">
                <button className="a-btn a-btn-ghost" onClick={closeModal}>Cancel</button>
                <button className="a-btn a-btn-primary" onClick={createWedding} disabled={saving||!modal.brideName||!modal.groomName||!modal.username}>
                  {saving ? <><span className="a-spinner"/>Creating…</> : "💍 Create Wedding"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
