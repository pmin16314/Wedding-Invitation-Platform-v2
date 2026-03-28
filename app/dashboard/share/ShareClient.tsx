"use client";
import { useState } from "react";
import { IconWhatsApp } from "@/components/icons";
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
                  <IconWhatsApp size={16} />
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
