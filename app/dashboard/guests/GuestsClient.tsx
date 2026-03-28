"use client";
import { useState } from "react";

const INVITE_TYPES = [
  { value:"MR",         label:"Mr.",        seats:1,    fixed:true  },
  { value:"MS",         label:"Ms.",        seats:1,    fixed:true  },
  { value:"MRS",        label:"Mrs.",       seats:1,    fixed:true  },
  { value:"MR_AND_MRS", label:"Mr. & Mrs.", seats:2,    fixed:true  },
  { value:"FAMILY",     label:"Family",     seats:null, fixed:false },
];

function typeLabel(t: string) { return INVITE_TYPES.find(x => x.value === t)?.label ?? t; }

interface Guest {
  id:string; name:string; phone:string|null;
  inviteType:string; shareStatus:string; token:string;
  group:string|null; side:string|null; maxAttendees:number;
  rsvp:{ attending:boolean; attendeeCount:number } | null;
}

export default function GuestsClient({ guests:initial, weddingPackage, weddingSlug }:{
  guests:Guest[]; weddingPackage:string; weddingSlug:string;
}) {
  const [guests,  setGuests]  = useState(initial);
  const [filter,  setFilter]  = useState("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({
    name:"", inviteType:"MR", phone:"", group:"", side:"", maxAttendees:2,
  });
  const [saving, setSaving] = useState(false);
  const APP = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const totalInvitedSeats   = guests.reduce((s,g) => s + g.maxAttendees, 0);
  const totalAttendingSeats = guests.reduce((s,g) => s + (g.rsvp?.attending ? g.rsvp.attendeeCount : 0), 0);
  const pendingGuests       = guests.filter(g => !g.rsvp).length;

  const selectedType  = INVITE_TYPES.find(t => t.value === form.inviteType);
  const showFamilyMax = form.inviteType === "FAMILY";

  const namePlaceholder: Record<string,string> = {
    MR:"Kasun Fernando", MS:"Dilini Perera", MRS:"Amaya Silva",
    MR_AND_MRS:"Mr. & Mrs. Fernando", FAMILY:"The Silva Family",
  };

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload: any = {
      name: form.name, inviteType: form.inviteType,
      phone: form.phone || undefined,
      group: form.group || undefined,
      side:  form.side  || undefined,
    };
    if (form.inviteType === "FAMILY") payload.maxAttendees = form.maxAttendees;
    const res = await fetch("/api/couple/guests", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { const j = await res.json().catch(()=>({error:"Failed"})); alert(j.error); return; }
    const j = await res.json();
    setGuests(gs => [j.data.guest, ...gs]);
    setShowAdd(false);
    setForm({ name:"", inviteType:"MR", phone:"", group:"", side:"", maxAttendees:2 });
  }

  async function del(id: string) {
    if (!confirm("Remove this guest?")) return;
    await fetch(`/api/couple/guests/${id}`, { method:"DELETE" });
    setGuests(gs => gs.filter(g => g.id !== id));
  }

  const filtered = filter==="ALL"        ? guests
    : filter==="RSVPD"                   ? guests.filter(g =>  g.rsvp)
    : filter==="PENDING"                 ? guests.filter(g => !g.rsvp)
    : filter==="SHARED"                  ? guests.filter(g =>  g.shareStatus !== "NOT_SHARED")
    : guests.filter(g => g.shareStatus === "NOT_SHARED");

  return (
    <div>
      {/* Seat summary */}
      <div className="db-mini-stats">
        {[
          { label:"Invited Seats",     value:totalInvitedSeats,   color:undefined,             sub:`${guests.length} guests` },
          { label:"Attending Seats",   value:totalAttendingSeats, color:"var(--green)",         sub:"confirmed" },
          { label:"Awaiting Response", value:pendingGuests,       color:"var(--charcoal-mute)", sub:"guests pending" },
        ].map(s => (
          <div key={s.label} className="db-card db-mini-stat">
            <div className="db-mini-stat-num" style={s.color ? {color:s.color} : {}}>{s.value}</div>
            <div className="db-mini-stat-lbl">{s.label}</div>
            <div className="db-mini-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <div className="db-toolbar">
        {["ALL","RSVPD","PENDING","SHARED","NOT SHARED"].map(s => (
          <button key={s} className={`db-btn db-btn-sm ${filter===s?"db-btn-primary":"db-btn-outline"}`} onClick={()=>setFilter(s)}>{s}</button>
        ))}
        <div className="db-toolbar-end">
          <button className="db-btn db-btn-primary" onClick={()=>setShowAdd(true)}>+ Add Guest</button>
        </div>
      </div>

      {/* Add guest form */}
      {showAdd && (
        <div className="db-card db-card-mt">
          <div className="db-card-header"><span className="db-card-title">Add Guest</span></div>
          <div className="db-card-body">
            <form onSubmit={addGuest}>
              <div className="db-form-grid">
                <div className="db-field">
                  <label className="db-label">Guest Type *</label>
                  <select className="db-select" value={form.inviteType}
                    onChange={e=>setForm(f=>({...f, inviteType:e.target.value}))}>
                    {INVITE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.label} — {t.fixed ? `${t.seats} seat${t.seats!==1?"s":""}` : "2–6 seats"}
                      </option>
                    ))}
                  </select>
                </div>

                {showFamilyMax && (
                  <div className="db-field">
                    <label className="db-label">Max Family Seats (2–6)</label>
                    <input className="db-input" type="number" min={2} max={6} value={form.maxAttendees}
                      onChange={e=>setForm(f=>({...f, maxAttendees:parseInt(e.target.value)||2}))}/>
                  </div>
                )}

                <div className="db-field">
                  <label className="db-label">Full Name *</label>
                  <input className="db-input" required value={form.name}
                    onChange={e=>setForm(f=>({...f, name:e.target.value}))}
                    placeholder={namePlaceholder[form.inviteType]}/>
                </div>

                <div className="db-field">
                  <label className="db-label">WhatsApp</label>
                  <input className="db-input" value={form.phone}
                    onChange={e=>setForm(f=>({...f, phone:e.target.value}))}
                    placeholder="+94771234567"/>
                </div>

                <div className="db-field">
                  <label className="db-label">Group <span className="db-hint">optional</span></label>
                  <input className="db-input" value={form.group}
                    onChange={e=>setForm(f=>({...f, group:e.target.value}))}
                    placeholder="School Friends"/>
                </div>

                <div className="db-field">
                  <label className="db-label">Side</label>
                  <select className="db-select" value={form.side}
                    onChange={e=>setForm(f=>({...f, side:e.target.value}))}>
                    <option value="">—</option>
                    <option value="BRIDE">Bride's side</option>
                    <option value="GROOM">Groom's side</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>

              <div className="db-guest-form-note">
                This guest occupies <strong>{form.inviteType==="FAMILY" ? `up to ${form.maxAttendees}` : selectedType?.seats ?? 1}</strong> seat{(form.inviteType==="FAMILY" || (selectedType?.seats??1) !== 1) ? "s" : ""} in your count.
              </div>

              <div className="db-form-actions">
                <button type="button" className="db-btn db-btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button type="submit" className="db-btn db-btn-primary" disabled={saving}>
                  {saving ? <><span className="db-spinner"/>Adding…</> : "Add Guest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest table */}
      <div className="db-card">
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Seats</th><th>WhatsApp</th><th>RSVP</th><th>Shared</th><th>Group</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.id}>
                  <td className="db-guest-name-cell">{g.name}</td>
                  <td><span className="db-guest-type">{typeLabel(g.inviteType)}</span></td>
                  <td className="db-guest-seats">
                    {g.inviteType === "FAMILY"
                      ? <span>{g.rsvp?.attending ? g.rsvp.attendeeCount : 0}<span className="db-guest-seats-max">/{g.maxAttendees}</span></span>
                      : <span>{g.rsvp?.attending ? g.rsvp.attendeeCount : g.maxAttendees}</span>
                    }
                  </td>
                  <td className="db-guest-phone">
                    {g.phone ?? <span className="db-guest-muted">—</span>}
                  </td>
                  <td>
                    {g.rsvp
                      ? <span className={`db-badge ${g.rsvp.attending?"db-badge-attending":"db-badge-declined"}`}>
                          {g.rsvp.attending ? `✓ ${g.rsvp.attendeeCount} attending` : "✗ Declined"}
                        </span>
                      : <span className="db-badge db-badge-pending">Pending</span>}
                  </td>
                  <td>
                    <span className={`db-badge ${g.shareStatus!=="NOT_SHARED"?"db-badge-shared":"db-badge-not-shared"}`}>
                      {g.shareStatus==="NOT_SHARED" ? "Not sent" : "Sent"}
                    </span>
                  </td>
                  <td className="db-guest-phone">
                    {g.group ?? <span className="db-guest-muted">—</span>}
                  </td>
                  <td>
                    <div className="db-guest-row-actions">
                      {weddingPackage !== "BASIC" && (
                        <a href={`${APP}/${weddingSlug}/guest/${g.token}`} target="_blank"
                          className="db-btn db-btn-sm db-btn-ghost">↗</a>
                      )}
                      <button className="db-btn db-btn-sm db-btn-danger-sm" onClick={()=>del(g.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="db-wishes-empty">No guests found.</div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="db-card-footer">
          <span className="db-guest-count-note">{guests.length} guests · {totalInvitedSeats} invited seats</span>
        </div>
      </div>
    </div>
  );
}
