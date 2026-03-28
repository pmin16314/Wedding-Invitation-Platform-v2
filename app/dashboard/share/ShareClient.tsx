"use client";
import { useState } from "react";

interface Guest { id:string; name:string; token:string; phone:string|null; shareStatus:string; lastSharedAt:string|null; }

export default function ShareClient({ guests, wedding }: { guests:Guest[]; wedding:any }) {
  const [selected,       setSelected]       = useState<string|null>(guests[0]?.id ?? null);
  const [template,       setTemplate]       = useState(wedding.content?.whatsappMessageTemplate ?? "");
  const [filter,         setFilter]         = useState<"ALL"|"NOT_SHARED"|"SHARED">("ALL");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [copied,         setCopied]         = useState(false);

  const baseUrl  = typeof window !== "undefined" ? window.location.origin : "";
  const filteredGuests = guests.filter(g =>
    filter === "ALL" ? true : filter === "NOT_SHARED" ? g.shareStatus === "NOT_SHARED" : g.shareStatus !== "NOT_SHARED"
  );
  const selectedGuest = guests.find(g => g.id === selected);

  function buildMessage(guest: Guest) {
    const link = `${baseUrl}/${wedding.slug}/guest/${guest.token}`;
    return template
      .replace(/{{guest_name}}/g,   guest.name)
      .replace(/{{bride_name}}/g,   wedding.content?.brideName  ?? "")
      .replace(/{{groom_name}}/g,   wedding.content?.groomName  ?? "")
      .replace(/{{wedding_date}}/g,  wedding.content?.weddingDate ? new Date(wedding.content.weddingDate).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "")
      + `\n\n${link}`;
  }

  async function saveTemplate() {
    setSavingTemplate(true);
    await fetch("/api/couple/share/template", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({template}) });
    setSavingTemplate(false);
  }

  async function recordShare(guestId: string, type: "COPIED"|"WA_OPENED") {
    await fetch(`/api/couple/guests/${guestId}/share`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({shareStatus:type}) });
  }

  const PLACEHOLDERS = ["{{guest_name}}","{{bride_name}}","{{groom_name}}","{{wedding_date}}"];

  return (
    <div className="db-share-layout">
      {/* Guest list */}
      <div>
        <div className="db-share-filters">
          {(["ALL","NOT_SHARED","SHARED"] as const).map(f => (
            <button key={f} className={`db-btn db-btn-sm ${filter===f?"db-btn-primary":"db-btn-outline"}`} onClick={()=>setFilter(f)}>
              {f==="ALL"?"All":f==="NOT_SHARED"?"Unsent":"Sent"}
            </button>
          ))}
        </div>
        <div className="db-card db-guest-list-card">
          {filteredGuests.map(g => (
            <div key={g.id} className="db-guest-list-item"
              style={{background: selected===g.id ? "var(--gold-pale)" : "white"}}
              onClick={()=>setSelected(g.id)}>
              <div className="db-guest-list-name">{g.name}</div>
              <div className="db-guest-list-meta">
                {g.shareStatus==="NOT_SHARED"
                  ? <span className="db-guest-unsent">Not yet sent</span>
                  : <span className="db-guest-sent">✓ Sent {g.lastSharedAt ? new Date(g.lastSharedAt).toLocaleDateString("en-GB") : ""}</span>}
              </div>
            </div>
          ))}
          {filteredGuests.length === 0 && <div className="db-guest-list-empty">No guests found.</div>}
        </div>
      </div>

      {/* Right panel */}
      <div className="db-share-panel">
        {/* Template editor */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Message Template</span>
            <button className="db-btn db-btn-sm db-btn-outline db-template-save-btn" onClick={saveTemplate} disabled={savingTemplate}>
              {savingTemplate ? "Saving…" : "Save Template"}
            </button>
          </div>
          <div className="db-card-body">
            <textarea className="db-textarea db-template-textarea" value={template}
              onChange={e=>setTemplate(e.target.value)} placeholder="Dear {{guest_name}}, we would be honoured…"/>
            <div className="db-placeholders-row">
              {PLACEHOLDERS.map(ph => (
                <button key={ph} className="db-btn db-btn-sm db-btn-outline db-ph-btn"
                  onClick={()=>setTemplate(t=>t+ph)}>{ph}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Share panel for selected guest */}
        {selectedGuest && (
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">{selectedGuest.name}</span>
            </div>
            <div className="db-card-body">
              <div className="db-share-preview">{buildMessage(selectedGuest)}</div>
              <div className="db-share-actions">
                <button className="db-btn db-btn-outline" onClick={async()=>{
                  await navigator.clipboard.writeText(buildMessage(selectedGuest));
                  await recordShare(selectedGuest.id,"COPIED");
                  setCopied(true); setTimeout(()=>setCopied(false),2000);
                }}>
                  {copied ? "✓ Copied" : "Copy Message"}
                </button>
                <a className="db-wa-btn" href={`https://wa.me/?text=${encodeURIComponent(buildMessage(selectedGuest))}`}
                  target="_blank" rel="noopener" onClick={()=>recordShare(selectedGuest.id,"WA_OPENED")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 0C5.364 0 0 5.363 0 11.989c0 2.117.556 4.107 1.527 5.832L0 24l6.335-1.652A11.96 11.96 0 0011.99 24c6.626 0 11.99-5.363 11.99-11.989C23.98 5.363 18.616 0 11.99 0zm0 21.818a9.803 9.803 0 01-5.002-1.368l-.359-.213-3.76.984 1.003-3.667-.234-.376A9.808 9.808 0 012.182 11.99c0-5.413 4.396-9.808 9.808-9.808 5.413 0 9.808 4.395 9.808 9.808 0 5.412-4.395 9.828-9.808 9.828z"/></svg>
                  Share on WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
