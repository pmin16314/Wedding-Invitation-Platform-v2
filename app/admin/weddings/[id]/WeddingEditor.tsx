"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast, SaveBar } from "@/app/admin/AdminUI";

/* ── Constants ── */
const SECTIONS: Record<string,string> = {
  hero:"Hero (Names & Date)", love_story:"Love Story", events:"Ceremonial Events",
  gallery:"Gallery", rsvp:"RSVP Form", wishes:"Guest Wishes",
};
const SLOT_META: Record<string,{label:string;pkg:string[];accept:string}> = {
  CORNER_TOP_RIGHT:   {label:"Corner — Top Right",    pkg:["CLASSIC","PREMIUM"], accept:"image/png,image/svg+xml"},
  CORNER_BOTTOM_LEFT: {label:"Corner — Bottom Left",  pkg:["CLASSIC","PREMIUM"], accept:"image/png,image/svg+xml"},
  BG_WASH:            {label:"Background Wash",        pkg:["CLASSIC","PREMIUM"], accept:"image/png"},
  CORNER_TOP_LEFT:    {label:"Corner — Top Left",     pkg:["PREMIUM"],           accept:"image/png,image/svg+xml"},
  CORNER_BOTTOM_RIGHT:{label:"Corner — Bottom Right", pkg:["PREMIUM"],           accept:"image/png,image/svg+xml"},
  MONOGRAM:           {label:"Monogram / Crest",       pkg:["PREMIUM"],           accept:"image/svg+xml"},
  DIVIDER_FLOURISH:   {label:"Divider Flourish",       pkg:["PREMIUM"],           accept:"image/svg+xml"},
};
const GOOGLE_FONTS = ["Cormorant Garamond","Playfair Display","EB Garamond","Lora","Libre Baskerville"];
const CAPS_FONTS   = ["Cinzel","Josefin Sans","Raleway","Montserrat","Cormorant SC"];
const BODY_FONTS   = ["Jost","Nunito","Lato","Source Sans 3","DM Sans","Inter"];
const EVENT_PRESETS= ["Seth Pirith","Poruwa Ceremony","Reception","Homecoming","Engagement","Dinner"];

type Theme = {primaryColor:string;accentColor:string;bgTint:string;scriptFont:string;capsFont:string;bodyFont:string};
type Asset = {id:string;slot:string;cloudinaryUrl:string;cloudinaryPublicId:string;opacity:number;sizePercent:number;fileType:string};

interface WeddingData {
  id:string; slug:string; status:string; package:string; sectionOrder:string[];
  couple:{username:string;email:string|null;name:string;createdAt:string};
  content:{
    brideName:string;groomName:string;brideParents:string;groomParents:string;
    bridePhone:string;groomPhone:string;weddingDate:string|null;
    venue:string;subVenue:string;venueAddress:string;googleMapsUrl:string;
    preInvitationText:string;invitationLine:string;
    loveStory:string;dressCode:string;religiousCeremony:string;
    postCeremonyNote:string;specialNote:string;
  }|null;
  theme:Theme|null;
  assets:Asset[];
  events:{id:string;title:string;time:string;location:string;nekathTime:string|null;notes:string|null;order:number}[];
  guestCount:number;rsvpCount:number;photoCount:number;
}

/* ── Confirm dialog ── */
interface ConfirmProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
function ConfirmDialog({ open, title, message, confirmLabel, confirmClass="a-btn-primary", onConfirm, onCancel }: ConfirmProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="a-confirm-backdrop" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="a-confirm-box">
        <div className="a-confirm-header">
          <div className="a-confirm-title">{title}</div>
        </div>
        <div className="a-confirm-body">{message}</div>
        <div className="a-confirm-footer">
          <button className="a-btn a-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`a-btn ${confirmClass}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Root editor ── */
export default function WeddingEditor({ wedding }: { wedding: WeddingData }) {
  const [tab,     setTab]     = useState<"details"|"events"|"design"|"couple">("details");
  const [confirm, setConfirm] = useState<null|{title:string;message:string;label:string;cls:string;action:()=>Promise<void>}>(null);
  const [actioning, setActioning] = useState(false);
  const router = useRouter();
  const toast  = useToast();
  const tabs: [string,string][] = [["details","Details"],["events","Events"],["design","Design"],["couple","Couple"]];

  async function runConfirmed() {
    if (!confirm) return;
    setActioning(true);
    await confirm.action();
    setActioning(false);
    setConfirm(null);
  }

  function statusAction(newStatus: "PUBLISHED"|"DRAFT"|"ARCHIVED") {
    const cfg = {
      PUBLISHED: { title:"Publish Invitation", message:`The invitation will go live at /${wedding.slug}. The slug cannot be changed after publishing.`, label:"Publish", cls:"a-btn-success" },
      DRAFT:     { title:"Move to Draft",      message:"The invitation will be taken offline. Guests with the link will no longer be able to access it.",  label:"Move to Draft", cls:"a-btn-outline" },
      ARCHIVED:  { title:"Archive Invitation", message:"The invitation will be archived. You can re-publish it at any time.", label:"Archive", cls:"a-btn-outline" },
    }[newStatus];
    setConfirm({
      ...cfg,
      action: async () => {
        const res = await fetch(`/api/admin/weddings/${wedding.id}/status`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status:newStatus}) });
        if (res.ok) { toast.show(`Invitation ${newStatus === "PUBLISHED" ? "published 🎉" : newStatus === "DRAFT" ? "moved to draft" : "archived"}`); router.refresh(); }
        else toast.show("Action failed", "error");
      },
    });
  }

  function deleteAction() {
    setConfirm({
      title: "Delete Wedding",
      message: "This permanently deletes the wedding, all guests, RSVPs, gallery photos, and messages. This cannot be undone.",
      label: "Delete Permanently",
      cls: "a-btn-danger",
      action: async () => {
        const res = await fetch(`/api/admin/weddings/${wedding.id}`, { method:"DELETE" });
        if (res.ok) { toast.show("Wedding deleted"); setTimeout(() => { window.location.href = "/admin/weddings"; }, 1000); }
        else toast.show("Delete failed", "error");
      },
    });
  }

  const sidePanel = (
    <div>
      {/* Stats */}
      <div className="a-side-card">
        <div className="a-side-card-header"><div className="a-side-card-title">Stats</div></div>
        <div className="a-side-card-body">
          {[{l:"GUESTS",v:wedding.guestCount},{l:"RSVPS",v:wedding.rsvpCount},{l:"PHOTOS",v:wedding.photoCount}].map(s=>(
            <div key={s.l} className="a-side-stat-row">
              <span className="a-side-stat-label">{s.l}</span>
              <span className="a-side-stat-value">{s.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="a-side-card">
        <div className="a-side-card-header"><div className="a-side-card-title">Quick Links</div></div>
        <div className="a-side-card-body">
          <a href={`/${wedding.slug}`} target="_blank" className="a-quick-link-icon">
            View Invitation <span>↗</span>
          </a>
          <a href={`/${wedding.slug}/couple-login`} target="_blank" className="a-quick-link-icon">
            Couple Login <span>↗</span>
          </a>
          <button className="a-quick-link-copy"
            onClick={()=>navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL??window.location.origin}/${wedding.slug}/couple-login`)
              .then(()=>toast.show("Login URL copied"))}>
            Copy Login URL
          </button>
        </div>
      </div>

      {/* Publication Status */}
      <div className="a-side-card">
        <div className="a-side-card-header"><div className="a-side-card-title">Publication Status</div></div>
        <div className="a-side-card-body">
          <div className="a-pub-status-label">
            Status: <span className={`a-badge a-badge-${wedding.status.toLowerCase()}`}>{wedding.status}</span>
          </div>
          <div className="a-pub-btn-row">
            {wedding.status === "DRAFT" && (
              <button className="a-btn a-btn-outline a-btn-sm" style={{gridColumn:"1/-1"}} onClick={() => statusAction("PUBLISHED")}>
                Publish Invitation
              </button>
            )}
            {wedding.status === "PUBLISHED" && (
              <>
                <button className="a-btn a-btn-outline a-btn-sm" style={{backgroundColor: "var(--light-gray)"}} onClick={() => statusAction("DRAFT")}>Draft</button>
                <button className="a-btn a-btn-outline a-btn-sm" onClick={() => statusAction("ARCHIVED")}>Archive</button>
              </>
            )}
            {wedding.status === "ARCHIVED" && (
              <button className="a-btn a-btn-outline a-btn-sm" style={{gridColumn:"1/-1"}} onClick={() => statusAction("PUBLISHED")}>
                Re-publish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="a-side-card a-danger-card">
        <div className="a-side-card-header"><div className="a-side-card-title">Danger Zone</div></div>
        <div className="a-side-card-body">
          <p className="a-danger-desc">Permanently deletes this wedding and all data.</p>
          <button className="a-btn a-btn-danger a-btn-full" onClick={deleteAction}>Delete Wedding</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ""}
        message={confirm?.message ?? ""}
        confirmLabel={actioning ? "…" : (confirm?.label ?? "")}
        confirmClass={confirm?.cls}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      />
      <div>
        <div className="a-tabs a-editor-tabs-wrap">
          {tabs.map(([k,l])=>(
            <button key={k} className={`a-tab${tab===k?" active":""}`} onClick={()=>setTab(k as any)}>{l}</button>
          ))}
        </div>
        <div className="a-editor-body">
          <div className="a-editor-grid">
            <div>
              {tab==="details" && <DetailsPanel w={wedding} onRefresh={()=>router.refresh()} onToast={toast.show}/>}
              {tab==="events"  && <EventsPanel  w={wedding} onRefresh={()=>router.refresh()} onToast={toast.show}/>}
              {tab==="design"  && <DesignPanel  w={wedding} onRefresh={()=>router.refresh()} onToast={toast.show}/>}
              {tab==="couple"  && <CouplePanel  w={wedding} onRefresh={()=>router.refresh()} onToast={toast.show}/>}
            </div>
            {sidePanel}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Details panel — matches screenshot layout ── */
function DetailsPanel({w,onRefresh,onToast}:{w:WeddingData;onRefresh:()=>void;onToast:(m:string,t?:"success"|"error")=>void}) {
  const initial = {
    brideName:w.content?.brideName??"", groomName:w.content?.groomName??"",
    bridePhone:w.content?.bridePhone??"", groomPhone:w.content?.groomPhone??"",
    weddingDate:w.content?.weddingDate?new Date(w.content.weddingDate).toISOString().slice(0,10):"",
    dressCode:w.content?.dressCode??"",
    venue:w.content?.venue??"", subVenue:w.content?.subVenue??"",
    venueAddress:w.content?.venueAddress??"", googleMapsUrl:w.content?.googleMapsUrl??"",
    preInvitationText:w.content?.preInvitationText??"Together with their families",
    invitationLine:w.content?.invitationLine??"is invited to celebrate the union of",
    // Keep these in payload even though not shown in this tab
    brideParents:w.content?.brideParents??"", groomParents:w.content?.groomParents??"",
    loveStory:w.content?.loveStory??"", religiousCeremony:w.content?.religiousCeremony??"",
    postCeremonyNote:w.content?.postCeremonyNote??"", specialNote:w.content?.specialNote??"",
  };
  const [form, setForm]     = useState(initial);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const f = (k:keyof typeof form) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(p=>({...p,[k]:e.target.value}));

  async function save(e?:React.FormEvent) {
    e?.preventDefault(); setSaving(true);
    const res = await fetch(`/api/admin/weddings/${w.id}/details`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
    const j   = await res.json(); setSaving(false);
    if(!res.ok){onToast(j.error??"Save failed","error");return;}
    onToast("Wedding details saved"); onRefresh();
  }

  return (
    <form onSubmit={save}>
      <h3 className="a-panel-title">Wedding Details</h3>

      {/* Couple */}
      <p className="a-panel-section">Couple</p>
      <div className="a-form-grid">
        <div className="a-field"><label className="a-label">Bride's Name</label><input className="a-input" value={form.brideName} onChange={f("brideName")} placeholder="Sachini Silva"/></div>
        <div className="a-field"><label className="a-label">Groom's Name</label><input className="a-input" value={form.groomName} onChange={f("groomName")} placeholder="Ruwan"/></div>
        <div className="a-field"><label className="a-label">Bride's Phone <span className="a-label-hint">RSVP</span></label><input className="a-input" value={form.bridePhone} onChange={f("bridePhone")} placeholder="+94 77 123 4567"/></div>
        <div className="a-field"><label className="a-label">Groom's Name <span className="a-label-hint">RSVP</span></label><input className="a-input" value={form.groomPhone} onChange={f("groomPhone")} placeholder="+94 71 123 4567"/></div>
      </div>

      {/* Date & Venue */}
      <p className="a-panel-section-mt">Date & Venue</p>
      <div className="a-form-grid">
        <div className="a-field"><label className="a-label">Wedding Date</label><input className="a-input" type="date" value={form.weddingDate} onChange={f("weddingDate")}/></div>
        <div className="a-field"><label className="a-label">Dress Code <span className="a-label-hint">optional</span></label><input className="a-input" value={form.dressCode} onChange={f("dressCode")} placeholder="Formal"/></div>
        <div className="a-field"><label className="a-label">Venue</label><input className="a-input" value={form.venue} onChange={f("venue")} placeholder="The Grand Garden Hotel"/></div>
        <div className="a-field"><label className="a-label">Hall / Ballroom Optional <span className="a-label-hint">optional</span></label><input className="a-input" value={form.subVenue} onChange={f("subVenue")} placeholder="The Grand Garden Hotel"/></div>
        <div className="a-field a-form-full"><label className="a-label">Venue Address</label><input className="a-input" value={form.venueAddress} onChange={f("venueAddress")} placeholder="123 Garden Road, Colombo 03"/></div>
        <div className="a-field a-form-full"><label className="a-label">Google Maps URL <span className="a-label-hint">optional</span></label><input className="a-input" value={form.googleMapsUrl} onChange={f("googleMapsUrl")} placeholder="https://maps.google.com/..."/></div>
      </div>

      {/* Invitation Line */}
      <div className="a-panel-divider">
        <h4 className="a-panel-h4">Invitation Line</h4>
        <p className="a-panel-desc">The formal text that appears on the invitation. Edit freely — preview updates live.</p>
        <div className="a-invite-presets" style={{marginBottom:14}}>
          <span className="a-invite-preset-lbl">Presets:</span>
          {[
            {pre:"Together with their families", body:"request the honour of your presence at the marriage of"},
            {pre:"Together with their parents",  body:"request the honour of your presence at the marriage of"},
          ].map((p,i)=>(
            <button key={i} type="button" className="a-btn a-btn-sm a-btn-outline"
              onClick={()=>setForm(fm=>({...fm,preInvitationText:p.pre,invitationLine:p.body}))}>
              Preset {i+1}
            </button>
          ))}
        </div>
        <div className="a-form-grid a-form-grid-mb">
          <div className="a-field">
            <label className="a-label">Opening Text <span className="a-label-hint">before guest name</span></label>
            <input className="a-input" value={form.preInvitationText} onChange={f("preInvitationText")} placeholder="Together with their families"/>
          </div>
          <div className="a-field">
            <label className="a-label">Invitation Body <span className="a-label-hint">after guest name</span></label>
            <input className="a-input" value={form.invitationLine} onChange={f("invitationLine")} placeholder="is invited to celebrate the union of"/>
          </div>
        </div>

        {/* Live preview — matches screenshot */}
        <div className="a-invite-preview">
          <p className="a-invite-preview-lbl">— Preview —</p>
          {form.preInvitationText && <p className="a-invite-preview-opening">{form.preInvitationText}</p>}
          <p style={{fontSize:13,color:"var(--charcoal-soft)",marginBottom:8}}>— Guest Name —</p>
          {form.invitationLine && <p className="a-invite-preview-body">{form.invitationLine}</p>}
          <p className="a-invite-preview-name" style={{fontSize:32,letterSpacing:".02em"}}>
            {form.brideName||"Sachini"} <span style={{fontFamily:"sans-serif",fontSize:18}}>&</span> {form.groomName||"Ruwan"}
          </p>
        </div>
      </div>

      <SaveBar onSave={()=>save()} saving={saving} dirty={dirty} label="Save Changes" />
    </form>
  );
}

/* ── Events panel ── */
function EventsPanel({w,onRefresh,onToast}:{w:WeddingData;onRefresh:()=>void;onToast:(m:string,t?:"success"|"error")=>void}) {
  const [events,  setEvents]  = useState(w.events);
  const [adding,  setAdding]  = useState(false);
  const [editing, setEditing] = useState<typeof w.events[0]|null>(null);

  const [confirmEventId, setConfirmEventId] = useState<string|null>(null);

  async function del(id:string) {
    const res = await fetch(`/api/couple/events/${id}`,{method:"DELETE"});
    if(res.ok){setEvents(es=>es.filter(e=>e.id!==id));onToast("Event removed");onRefresh();}
    else onToast("Failed to remove event","error");
    setConfirmEventId(null);
  }

  return (
    <div>
      <ConfirmDialog
        open={!!confirmEventId}
        title="Remove Event"
        message="This will remove the event from the invitation timeline."
        confirmLabel="Remove"
        confirmClass="a-btn-danger"
        onConfirm={() => confirmEventId && del(confirmEventId)}
        onCancel={() => setConfirmEventId(null)}
      />
      <div className="a-events-header">
        <h3 className="a-panel-title-inline">Event Timeline</h3>
        <button className="a-btn a-btn-primary a-btn-sm" onClick={()=>{setAdding(true);setEditing(null);}}>+ Add Event</button>
      </div>
      {(adding||editing) && <EventForm weddingId={w.id} existing={editing} nextOrder={events.length}
        onSaved={ev=>{if(editing){setEvents(es=>es.map(e=>e.id===ev.id?ev:e));setEditing(null);}else{setEvents(es=>[...es,ev]);setAdding(false);}onToast(editing?"Event updated":"Event added");onRefresh();}}
        onCancel={()=>{setAdding(false);setEditing(null);}}
        onToast={onToast}
      />}
      {events.length===0 && !adding
        ? <div className="a-empty"><div className="a-empty-icon">📅</div><div className="a-empty-title">No events yet</div><div className="a-empty-text">Add Seth Pirith, Poruwa Ceremony, Reception…</div></div>
        : events.map((ev,i)=>(
          <div key={ev.id} className="a-event-row">
            <div className="a-event-num">{i+1}</div>
            <div className="a-form-grid a-event-grid">
              <div className="a-field"><label className="a-label">Event</label><input className="a-input" value={ev.title} readOnly/></div>
              <div className="a-field"><label className="a-label">Time</label><input className="a-input" value={new Date(ev.time).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})} readOnly/></div>
              <div className="a-field a-form-full"><label className="a-label">Location</label><input className="a-input" value={ev.location} readOnly/></div>
              {ev.nekathTime && <div className="a-field"><label className="a-label">Nekath</label><input className="a-input" value={ev.nekathTime} readOnly/></div>}
            </div>
            <div className="a-event-actions">
              <button className="a-btn a-btn-sm a-btn-outline" onClick={()=>{setEditing(ev);setAdding(false);}}>Edit</button>
              <button className="a-event-remove" onClick={()=>setConfirmEventId(ev.id)}>✕</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}

function EventForm({weddingId,existing,nextOrder,onSaved,onCancel,onToast}:{weddingId:string;existing:any;nextOrder:number;onSaved:(e:any)=>void;onCancel:()=>void;onToast:(m:string,t?:"success"|"error")=>void}) {
  const isEdit = !!existing;
  const [form,setForm] = useState({
    title:existing?.title??"", time:existing?.time?new Date(existing.time).toISOString().slice(0,16):"",
    location:existing?.location??"", nekathTime:existing?.nekathTime??"",
    notes:existing?.notes??"", order:existing?.order??nextOrder,
  });
  const [saving,setSaving] = useState(false);

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const url = isEdit ? `/api/couple/events/${existing.id}` : "/api/couple/events";
    const res = await fetch(url,{method:isEdit?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,weddingId})});
    const j   = await res.json(); setSaving(false);
    if(!res.ok){onToast(j.error??"Failed","error");return;}
    onSaved(j.data.event);
  }

  return (
    <div className="a-event-form">
      <form onSubmit={submit}>
        <div className="a-event-presets">
          <span className="a-event-preset-lbl">Presets:</span>
          {EVENT_PRESETS.map(p=>(
            <button key={p} type="button" className={`a-btn a-btn-sm ${form.title===p?"a-btn-primary":"a-btn-outline"}`}
              onClick={()=>setForm(f=>({...f,title:p}))}>{p}</button>
          ))}
        </div>
        <div className="a-form-grid">
          <div className="a-field"><label className="a-label">Event Name *</label><input className="a-input" required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Poruwa Ceremony"/></div>
          <div className="a-field"><label className="a-label">Date & Time *</label><input className="a-input" type="datetime-local" required value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/></div>
          <div className="a-field a-form-full"><label className="a-label">Venue *</label><input className="a-input" required value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Cinnamon Grand Ballroom, Colombo"/></div>
          <div className="a-field"><label className="a-label">Nekath Time <span className="a-label-hint">optional</span></label><input className="a-input" value={form.nekathTime} onChange={e=>setForm(f=>({...f,nekathTime:e.target.value}))} placeholder="9:47 AM"/></div>
          <div className="a-field"><label className="a-label">Notes <span className="a-label-hint">optional</span></label><input className="a-input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Additional info"/></div>
        </div>
        <div className="a-form-actions">
          <button type="button" className="a-btn a-btn-ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="a-btn a-btn-primary" disabled={saving}>
            {saving ? <><span className="a-spinner"/>Saving…</> : isEdit ? "Save Changes" : "Add Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Design panel ── */
function DesignPanel({w,onRefresh,onToast}:{w:WeddingData;onRefresh:()=>void;onToast:(m:string,t?:"success"|"error")=>void}) {
  const initialTheme = w.theme??{primaryColor:"#C9606A",accentColor:"#C9A84C",bgTint:"#FDF9F5",scriptFont:"Cormorant Garamond",capsFont:"Cinzel",bodyFont:"Jost"};
  const [theme,    setTheme]    = useState<Theme>(initialTheme);
  const [sections, setSections] = useState<string[]>(w.sectionOrder??Object.keys(SECTIONS));
  const [assets,   setAssets]   = useState<Record<string,Asset>>(Object.fromEntries(w.assets.map(a=>[a.slot,a])));
  const [savingTheme,    setSavingTheme]    = useState(false);
  const [savingSections, setSavingSections] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router    = useRouter();

  const initialSections = w.sectionOrder??Object.keys(SECTIONS);
  const themeDirty    = JSON.stringify(theme)    !== JSON.stringify(initialTheme);
  const sectionsDirty = JSON.stringify(sections) !== JSON.stringify(initialSections);
  const availSlots    = Object.keys(SLOT_META).filter(s=>SLOT_META[s].pkg.includes(w.package));

  async function saveTheme() {
    setSavingTheme(true);
    const res = await fetch(`/api/admin/weddings/${w.id}/theme`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(theme)});
    setSavingTheme(false);
    if(res.ok){onToast("Theme saved");onRefresh();}
    else onToast("Failed to save theme","error");
  }
  async function saveSections() {
    setSavingSections(true);
    const res = await fetch(`/api/admin/weddings/${w.id}/sections`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({sectionOrder:sections})});
    setSavingSections(false);
    if(res.ok){onToast("Sections saved");onRefresh();}
    else onToast("Failed to save sections","error");
  }

  return (
    <div className="a-design-section">
      <div>
        <h3 className="a-panel-title">Colour Theme</h3>
        {w.package==="BASIC" && <div className="a-banner a-banner-info a-mb-4">Custom theme available on Classic and Premium.</div>}
        <div className="a-swatch-grid">
          {[{k:"primaryColor" as const,l:"Primary",h:"Names, buttons"},{k:"accentColor" as const,l:"Accent",h:"Gold, dividers"},{k:"bgTint" as const,l:"Background",h:"Page tint"}].map(({k,l,h})=>(
            <div key={k} className="a-swatch">
              <div className="a-swatch-preview" style={{background:theme[k]}}/>
              <div className="a-swatch-label">{l} <span className="a-swatch-hint">{h}</span></div>
              <div className="a-swatch-row">
                <input type="color" className="a-swatch-picker" value={theme[k]} onChange={e=>setTheme(t=>({...t,[k]:e.target.value}))}/>
                <input className="a-swatch-hex" value={theme[k]} onChange={e=>setTheme(t=>({...t,[k]:e.target.value}))}/>
              </div>
            </div>
          ))}
        </div>
        <div className="a-form-grid a-form-grid-mt">
          {[{k:"scriptFont" as const,l:"Script Font",opts:GOOGLE_FONTS},{k:"capsFont" as const,l:"Caps Font",opts:CAPS_FONTS},{k:"bodyFont" as const,l:"Body Font",opts:BODY_FONTS}].map(({k,l,opts})=>(
            <div key={k} className="a-field"><label className="a-label">{l}</label>
              <select className="a-select" value={theme[k]} onChange={e=>setTheme(t=>({...t,[k]:e.target.value}))}>
                {opts.map(f=><option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="a-theme-preview" style={{background:theme.bgTint}}>
          <p className="a-theme-preview-label" style={{fontFamily:`'${theme.capsFont}', serif`,color:theme.accentColor}}>Preview</p>
          <p style={{fontFamily:`'${theme.scriptFont}', serif`,fontSize:28,color:theme.primaryColor,lineHeight:1.1,transition:"all .3s"}}>Bride &amp; Groom</p>
          <div className="a-theme-preview-divider" style={{background:theme.accentColor}}/>
          <p className="a-theme-preview-date" style={{fontFamily:`'${theme.bodyFont}', sans-serif`,color:theme.accentColor}}>Saturday, 22 November 2026</p>
        </div>
        <SaveBar onSave={saveTheme} saving={savingTheme} dirty={themeDirty} label="Save Theme" />
      </div>

      <div className="a-design-block">
        <h3 className="a-panel-title">Invitation Sections</h3>
        <p className="a-panel-desc">Toggle on/off. Hero is always first.</p>
        {Object.entries(SECTIONS).map(([key,label])=>{
          const active = sections.includes(key);
          const idx    = sections.indexOf(key);
          return (
            <div key={key} className={`a-section-row${active?"":" inactive"}`}>
              {active && <span className="a-section-drag">⠿</span>}
              <span className="a-section-name">{label}</span>
              {active && idx>=0 && <span className="a-section-num">{idx+1}</span>}
              {key!=="hero" && (
                <button className={`a-btn a-btn-sm ${active?"a-btn-outline":"a-btn-primary"}`} style={{fontSize:10,padding:"4px 10px"}}
                  onClick={()=>setSections(s=>active?s.filter(x=>x!==key):[...s,key])}>
                  {active?"Remove":"+ Add"}
                </button>
              )}
              {key==="hero" && <span className="a-section-required">Required</span>}
            </div>
          );
        })}
        <SaveBar onSave={saveSections} saving={savingSections} dirty={sectionsDirty} label="Save Sections" />
      </div>

      {w.package!=="BASIC" && (
        <div className="a-design-block">
          <h3 className="a-panel-title">Designer Assets</h3>
          <div className="a-banner a-banner-info a-mb-4">PNG: transparent bg, min 2000px · SVG: closed paths, no embedded rasters</div>
          <div className="a-assets-list">
            {availSlots.map(slot=>(
              <AssetSlotRow key={slot} weddingId={w.id} slot={slot} label={SLOT_META[slot].label}
                accept={SLOT_META[slot].accept} existing={assets[slot]??null}
                onChanged={a=>{if(!a){setAssets(p=>{const n={...p};delete n[slot];return n;});}else{setAssets(p=>({...p,[slot]:a}));}onRefresh();}}
                onToast={onToast}/>
            ))}
          </div>
        </div>
      )}

      <div className="a-design-block">
        <div className="a-design-block-header">
          <h3 className="a-panel-title-inline">Live Preview</h3>
          <div className="a-table-actions">
            <a href={`/${w.slug}/preview`} target="_blank" className="a-btn a-btn-sm a-btn-outline">Open full ↗</a>
            <button className="a-btn a-btn-sm a-btn-ghost" onClick={()=>iframeRef.current?.contentWindow?.location.reload()}>↻ Refresh</button>
          </div>
        </div>
        <div className="a-preview-wrap">
          <div className="a-preview-bar">
            {["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} className="a-preview-dot" style={{background:c}}/>)}
            <span className="a-preview-slug">/{w.slug}</span>
          </div>
          <iframe ref={iframeRef} src={`/${w.slug}/preview`} className="a-preview-iframe" title="Live preview"/>
        </div>
      </div>
    </div>
  );
}

/* ── Couple panel ── */
function CouplePanel({w,onRefresh,onToast}:{w:WeddingData;onRefresh:()=>void;onToast:(m:string,t?:"success"|"error")=>void}) {
  const [pw,          setPw]          = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [copied,      setCopied]      = useState(false);
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000";
  const loginUrl = `${appUrl}/${w.slug}/couple-login`;

  async function resetPassword(e:React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch(`/api/admin/weddings/${w.id}/credentials`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({newPassword:pw})});
    setSaving(false);
    if(res.ok){onToast("Password updated");setPw("");}
    else onToast("Failed to update password","error");
  }
  async function resetUsername(e:React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch(`/api/admin/weddings/${w.id}/credentials`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({newUsername})});
    setSaving(false);
    if(res.ok){onToast("Username updated");setNewUsername("");onRefresh();}
    else{const j=await res.json();onToast(j.error??"Failed to update username","error");}
  }

  return (
    <div>
      <h3 className="a-panel-title">Couple Account</h3>
      <div className="a-couple-info-grid">
        {[["NAME",w.couple.name],["USERNAME",w.couple.username],["EMAIL",w.couple.email||"—"],["CREATED",new Date(w.couple.createdAt).toLocaleDateString("en-GB")],["ACCOUNT ID",w.id.slice(0,12)+"…"]].map(([l,v])=>(
          <div key={l} className="a-couple-info-item">
            <div className="a-couple-info-lbl">{l}</div>
            <div className={`a-couple-info-val${l==="USERNAME"?" bold":""}`}>{v}</div>
          </div>
        ))}
      </div>
      <div className="a-field a-field-mb">
        <label className="a-label">Couple Login URL</label>
        <div className="a-inline-form">
          <input className="a-input a-input-mono a-input-flex" value={loginUrl} readOnly/>
          <button className="a-btn a-btn-outline" onClick={async()=>{await navigator.clipboard.writeText(loginUrl);setCopied(true);setTimeout(()=>setCopied(false),2000);}}>
            {copied?"✓ Copied":"Copy"}
          </button>
        </div>
      </div>
      <div className="a-field a-field-mb">
        <label className="a-label">Change Username</label>
        <form onSubmit={resetUsername} className="a-inline-form">
          <input className="a-input a-input-mono a-input-flex" type="text" placeholder="New username (e.g. ishara.panchana)"
            value={newUsername} onChange={e=>setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g,""))}
            required minLength={3}/>
          <button className="a-btn a-btn-outline" type="submit" disabled={saving||newUsername.length<3}>
            {saving?"Saving…":"Update"}
          </button>
        </form>
      </div>
      <div className="a-field">
        <label className="a-label">Reset Password</label>
        <form onSubmit={resetPassword} className="a-inline-form">
          <input className="a-input a-input-flex" type="password" placeholder="New password (min 8)"
            value={pw} onChange={e=>setPw(e.target.value)} required minLength={8}/>
          <button className="a-btn a-btn-primary" type="submit" disabled={saving||pw.length<8}>
            {saving?"Saving…":"Update"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Asset slot row ── */
function AssetSlotRow({weddingId,slot,label,accept,existing,onChanged,onToast}:{weddingId:string;slot:string;label:string;accept:string;existing:Asset|null;onChanged:(a:Asset|null)=>void;onToast:(m:string,t?:"success"|"error")=>void}) {
  const [open,      setOpen]      = useState(!!existing);
  const [opacity,   setOpacity]   = useState(existing?.opacity??0.85);
  const [size,      setSize]      = useState(existing?.sizePercent??52);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file:File) {
    setUploading(true);
    try {
      const sig   = await(await fetch("/api/assets/upload/sign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({weddingId,slot})})).json();
      const fd    = new FormData();
      fd.append("file",file); fd.append("signature",sig.signature); fd.append("timestamp",String(sig.timestamp));
      fd.append("api_key",sig.apiKey); fd.append("folder",sig.folder);
      if(sig.publicId) fd.append("public_id",sig.publicId);
      const cloud = await(await fetch(sig.uploadUrl,{method:"POST",body:fd})).json();
      const save  = await fetch(`/api/admin/weddings/${weddingId}/assets/${slot}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({cloudinaryUrl:cloud.secure_url,cloudinaryPublicId:cloud.public_id,opacity,sizePercent:size,fileType:file.type==="image/svg+xml"?"SVG":"PNG"})});
      const sj    = await save.json();
      if(save.ok){onChanged(sj.data.asset);setOpen(true);onToast("Asset uploaded");}
      else onToast("Upload failed","error");
    } catch(e:any){onToast(e.message,"error");}
    setUploading(false);
  }

  return (
    <div className="a-asset-slot">
      <button className="a-asset-slot-header" onClick={()=>setOpen(o=>!o)}>
        <div className={`a-asset-dot${existing?" filled":" empty"}`}/>
        {existing && <img src={existing.cloudinaryUrl} alt="" className="a-asset-thumb-sm"/>}
        <span className="a-asset-label">{label}</span>
        <span className="a-asset-chevron">{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div className="a-asset-body">
          {existing ? (
            <>
              <div className="a-asset-controls">
                <img src={existing.cloudinaryUrl} alt="" className="a-asset-thumb"/>
                <div className="a-asset-sliders">
                  <div className="a-field">
                    <label className="a-label">Opacity — {Math.round(opacity*100)}%</label>
                    <input type="range" min={0.1} max={1} step={0.01} value={opacity} onChange={e=>setOpacity(parseFloat(e.target.value))} className="a-range-full"/>
                  </div>
                  <div className="a-field">
                    <label className="a-label">Size — {size}% width</label>
                    <input type="range" min={30} max={80} step={1} value={size} onChange={e=>setSize(parseInt(e.target.value))} className="a-range-full"/>
                  </div>
                </div>
              </div>
              <div className="a-asset-btn-row">
                <button className="a-btn a-btn-sm a-btn-primary" onClick={async()=>{
                  const res = await fetch(`/api/admin/weddings/${weddingId}/assets/${slot}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({opacity,sizePercent:size})});
                  const j   = await res.json(); if(j.ok){onChanged(j.data.asset);onToast("Asset controls saved");}
                }}>Save</button>
                <label className="a-btn a-btn-sm a-btn-outline" style={{cursor:"pointer"}}>
                  Replace<input type="file" accept={accept} style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value="";}}/>
                </label>
                <AssetRemoveButton weddingId={weddingId} slot={slot} onChanged={onChanged} setOpen={setOpen} onToast={onToast}/>
              </div>
            </>
          ) : (
            <label className="a-drop-zone">
              {uploading
                ? <><div className="a-drop-icon">⏳</div><div className="a-drop-text">Uploading…</div></>
                : <><div className="a-drop-icon">↑</div><div className="a-drop-text">Click to upload {accept.includes("svg")?"PNG or SVG":"PNG"}</div></>
              }
              <input type="file" accept={accept} style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);e.target.value="";}}/>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Asset remove button (with inline confirm) ── */
function AssetRemoveButton({ weddingId, slot, onChanged, setOpen, onToast }: {
  weddingId:string; slot:string;
  onChanged:(a:null)=>void; setOpen:(v:boolean)=>void;
  onToast:(m:string,t?:"success"|"error")=>void;
}) {
  const [open, setConfirmOpen] = useState(false);
  return (
    <>
      <button className="a-btn a-btn-sm a-btn-danger a-asset-btn-remove" onClick={() => setConfirmOpen(true)}>
        Remove
      </button>
      <ConfirmDialog
        open={open}
        title="Remove Asset"
        message="This will permanently delete the designer asset from this slot."
        confirmLabel="Remove"
        confirmClass="a-btn-danger"
        onConfirm={async () => {
          await fetch(`/api/admin/weddings/${weddingId}/assets/${slot}`, { method:"DELETE" });
          onChanged(null); setOpen(false); onToast("Asset removed");
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
