"use client";
import { useState } from "react";

const DEFAULT_INVITATION_LINE = "Together with their families, request the honour of your presence at the marriage of";
const DEFAULT_PRE_TEXT = "Together with their families";

interface ContentData {
  brideName:string; groomName:string; weddingDate:string|null;
  venue:string; subVenue:string; venueAddress:string; googleMapsUrl:string;
  brideParents:string; groomParents:string; bridePhone:string; groomPhone:string;
  preInvitationText:string; invitationLine:string;
  loveStory:string; dressCode:string; religiousCeremony:string;
  postCeremonyNote:string; specialNote:string;
}

export default function ContentClient({ content, wedding }: { content:any; wedding:any }) {
  const [form, setForm] = useState<ContentData>({
    brideName:         content?.brideName         ?? "",
    groomName:         content?.groomName         ?? "",
    weddingDate:       content?.weddingDate ? new Date(content.weddingDate).toISOString().slice(0,10) : "",
    venue:             content?.venue             ?? "",
    subVenue:          content?.subVenue          ?? "",
    venueAddress:      content?.venueAddress      ?? "",
    googleMapsUrl:     content?.googleMapsUrl     ?? "",
    brideParents:      content?.brideParents      ?? "",
    groomParents:      content?.groomParents      ?? "",
    bridePhone:        content?.bridePhone        ?? "",
    groomPhone:        content?.groomPhone        ?? "",
    preInvitationText: content?.preInvitationText ?? DEFAULT_PRE_TEXT,
    invitationLine:    content?.invitationLine    ?? DEFAULT_INVITATION_LINE,
    loveStory:         content?.loveStory         ?? "",
    dressCode:         content?.dressCode         ?? "",
    religiousCeremony: content?.religiousCeremony ?? "",
    postCeremonyNote:  content?.postCeremonyNote  ?? "",
    specialNote:       content?.specialNote       ?? "",
  });
  const [status, setStatus] = useState("idle");
  const f = (k: keyof ContentData) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) =>
    setForm(p => ({...p, [k]: e.target.value}));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setStatus("saving");
    const res = await fetch("/api/couple/content", {
      method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form),
    });
    setStatus(res.ok ? "saved" : "error");
    if (res.ok) setTimeout(() => setStatus("idle"), 2500);
  }

  const Section = ({ title }: { title: string }) => (
    <div className="db-section-head">
      <h4 className="db-section-title">{title}</h4>
    </div>
  );

  return (
    <form onSubmit={save}>
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Wedding Details</span>
          <div className="db-save-row db-ml-auto">
            {status==="saved"  && <span className="db-saved-msg">✓ Saved</span>}
            {status==="error"  && <span className="db-error-msg">Save failed</span>}
            <button type="submit" className="db-btn db-btn-primary" disabled={status==="saving"}>
              {status==="saving" ? <><span className="db-spinner"/>Saving…</> : "Save Changes"}
            </button>
          </div>
        </div>
        <div className="db-card-body">
          <div className="db-form-grid">
            <Section title="Couple" />
            <div className="db-field"><label className="db-label">Bride's Name</label><input className="db-input" value={form.brideName} onChange={f("brideName")} placeholder="Sachini"/></div>
            <div className="db-field"><label className="db-label">Groom's Name</label><input className="db-input" value={form.groomName} onChange={f("groomName")} placeholder="Mark"/></div>
            <div className="db-field"><label className="db-label">Bride's Phone <span className="db-hint">for RSVP</span></label><input className="db-input" value={form.bridePhone} onChange={f("bridePhone")} placeholder="+94 77 123 4567"/></div>
            <div className="db-field"><label className="db-label">Groom's Phone <span className="db-hint">for RSVP</span></label><input className="db-input" value={form.groomPhone} onChange={f("groomPhone")} placeholder="+94 71 123 4567"/></div>

            <Section title="Parents" />
            <div className="db-field"><label className="db-label">Bride's Parents</label><input className="db-input" value={form.brideParents} onChange={f("brideParents")} placeholder="Mr. & Mrs. Krishantha Silva"/></div>
            <div className="db-field"><label className="db-label">Groom's Parents</label><input className="db-input" value={form.groomParents} onChange={f("groomParents")} placeholder="Mr. & Mrs. Dion Juriansz"/></div>

            <Section title="Date & Venue" />
            <div className="db-field"><label className="db-label">Wedding Date</label><input className="db-input" type="date" value={form.weddingDate ?? ""} onChange={f("weddingDate")}/></div>
            <div className="db-field"><label className="db-label">Dress Code</label><input className="db-input" value={form.dressCode} onChange={f("dressCode")} placeholder="Formal"/></div>
            <div className="db-field"><label className="db-label">Venue Name</label><input className="db-input" value={form.venue} onChange={f("venue")} placeholder="The Grand Garden Hotel"/></div>
            <div className="db-field"><label className="db-label">Hall / Ballroom</label><input className="db-input" value={form.subVenue} onChange={f("subVenue")} placeholder="Grand Ballroom"/></div>
            <div className="db-field db-form-full"><label className="db-label">Venue Address</label><input className="db-input" value={form.venueAddress} onChange={f("venueAddress")} placeholder="123 Garden Road, Colombo 03"/></div>
            <div className="db-field db-form-full"><label className="db-label">Google Maps URL <span className="db-hint">optional</span></label><input className="db-input" value={form.googleMapsUrl} onChange={f("googleMapsUrl")} placeholder="https://maps.google.com/..."/></div>

            <Section title="Ceremony" />
            <div className="db-field db-form-full"><label className="db-label">Religious / Ceremony Line <span className="db-hint">optional</span></label><input className="db-input" value={form.religiousCeremony} onChange={f("religiousCeremony")} placeholder="As they are united in the Lord Jesus Christ"/></div>
            <div className="db-field db-form-full"><label className="db-label">Post-Ceremony Note <span className="db-hint">optional</span></label><input className="db-input" value={form.postCeremonyNote} onChange={f("postCeremonyNote")} placeholder="We warmly welcome you to remain for tea after the ceremony"/></div>

            <Section title="Story & Notes" />
            <div className="db-field db-form-full"><label className="db-label">Love Story</label><textarea className="db-textarea" value={form.loveStory} onChange={f("loveStory")} placeholder="How did you meet?…" style={{minHeight:80}}/></div>
            <div className="db-field db-form-full"><label className="db-label">Special Note to Guests</label><textarea className="db-textarea" value={form.specialNote} onChange={f("specialNote")} placeholder="Please join us for dinner…" style={{minHeight:60}}/></div>
          </div>
        </div>
      </div>

      {/* Invitation Line */}
      <div className="db-card db-card-mt">
        <div className="db-card-header">
          <span className="db-card-title">Invitation Line</span>
          <span className="db-card-subtitle-meta">Appears at the top of the invitation</span>
        </div>
        <div className="db-card-body">
          <div className="db-form-grid">
            <div className="db-field">
              <label className="db-label">Opening Text <span className="db-hint">before names</span></label>
              <input className="db-input" value={form.preInvitationText} onChange={f("preInvitationText")} placeholder="Together with their families"/>
              <div className="db-hint-mt">e.g. "Together with their families" or "Together with their parents"</div>
            </div>
            <div className="db-field">
              <label className="db-label">Invitation Body <span className="db-hint">after names</span></label>
              <input className="db-input" value={form.invitationLine} onChange={f("invitationLine")} placeholder="request the honour of your presence"/>
            </div>
          </div>

          <div className="db-presets-section">
            <div className="db-presets-lbl">Quick presets:</div>
            <div className="db-presets-row">
              {[
                { pre:"Together with their families",   body:"request the honour of your presence at the marriage of" },
                { pre:"Together with their parents",    body:"request the honour of your presence at the marriage of" },
                { pre:"Mr. & Mrs. Silva\nTogether with Mr. & Mrs. Fernando", body:"request the honour of your presence" },
              ].map((p,i) => (
                <button key={i} type="button" className="db-btn db-btn-sm db-btn-outline"
                  onClick={()=>setForm(f=>({...f,preInvitationText:p.pre,invitationLine:p.body}))}>
                  Preset {i+1}
                </button>
              ))}
              <button type="button" className="db-btn db-btn-sm db-btn-ghost"
                onClick={()=>setForm(f=>({...f,preInvitationText:DEFAULT_PRE_TEXT,invitationLine:DEFAULT_INVITATION_LINE}))}>
                Reset to default
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className="db-invite-preview">
            <p className="db-invite-preview-lbl">— Preview —</p>
            {form.preInvitationText && <p className="db-invite-opening">{form.preInvitationText}</p>}
            <p className="db-invite-name">{form.brideName || "Bride"}</p>
            <p className="db-invite-and">and</p>
            <p className="db-invite-name">{form.groomName || "Groom"}</p>
            {form.invitationLine && <p className="db-invite-body">{form.invitationLine}</p>}
            <div className="db-invite-date">
              <span>{form.weddingDate ? new Date(form.weddingDate+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"}) : "Saturday, 22 November 2026"}</span>
            </div>
            {(form.venue||form.subVenue) && (
              <p className="db-invite-venue">
                {form.subVenue && <span className="db-invite-sub-venue">{form.subVenue}</span>}
                {form.venue && <span>{form.venue}</span>}
                {form.venueAddress && <span className="db-invite-address">{form.venueAddress}</span>}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
