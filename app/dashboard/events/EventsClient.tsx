"use client";
import { useState } from "react";

const PRESETS = ["Seth Pirith","Poruwa Ceremony","Reception","Homecoming","Engagement","Dinner"];

interface WeddingEvent {
  id:string; title:string; time:string; location:string;
  nekathTime:string|null; notes:string|null; order:number;
}

export default function EventsClient({ events: initial, weddingId }: { events: WeddingEvent[]; weddingId: string }) {
  const [events,  setEvents]  = useState(initial);
  const [adding,  setAdding]  = useState(false);
  const [editing, setEditing] = useState<WeddingEvent|null>(null);

  async function del(id: string) {
    if (!confirm("Remove this event?")) return;
    const res = await fetch(`/api/couple/events/${id}`, { method:"DELETE" });
    if (res.ok) setEvents(es => es.filter(e => e.id !== id));
  }

  return (
    <div>
      <div className="db-events-header">
        <button className="db-btn db-btn-primary db-btn-sm" onClick={()=>{setAdding(true);setEditing(null);}}>+ Add Event</button>
      </div>

      {(adding || editing) && (
        <div className="db-card db-event-form-card">
          <div className="db-card-body">
            <EventForm weddingId={weddingId} existing={editing} nextOrder={events.length}
              onSaved={ev => {
                if (editing) { setEvents(es => es.map(e => e.id===ev.id ? ev : e)); setEditing(null); }
                else { setEvents(es => [...es, ev]); setAdding(false); }
              }}
              onCancel={() => { setAdding(false); setEditing(null); }}
            />
          </div>
        </div>
      )}

      <div className="db-card">
        <div className="db-event-list">
          {events.length === 0 && !adding ? (
            <div className="db-event-empty">
              <div className="db-event-empty-icon">📅</div>
              <div className="db-event-empty-text">No events yet. Add your Seth Pirith, Poruwa Ceremony, and Reception.</div>
            </div>
          ) : events.map((ev, i) => (
            <div key={ev.id} className="db-event-row-inner">
              <div className="db-event-num">{i+1}</div>
              <div className="db-event-content">
                <div className="db-event-title">{ev.title}</div>
                <div className="db-event-time">
                  {new Date(ev.time).toLocaleString("en-GB",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                  {ev.nekathTime && <span className="db-event-nekath">Nekath: {ev.nekathTime}</span>}
                </div>
                <div className="db-event-location">{ev.location}</div>
                {ev.notes && <div className="db-event-notes">{ev.notes}</div>}
              </div>
              <div className="db-event-actions">
                <button className="db-btn db-btn-sm db-btn-outline" onClick={()=>{setEditing(ev);setAdding(false);}}>Edit</button>
                <button className="db-btn db-btn-sm db-btn-danger-sm" onClick={()=>del(ev.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventForm({ weddingId, existing, nextOrder, onSaved, onCancel }: {
  weddingId:string; existing:WeddingEvent|null; nextOrder:number;
  onSaved:(e:WeddingEvent)=>void; onCancel:()=>void;
}) {
  const isEdit = !!existing;
  const [form, setForm] = useState({
    title:     existing?.title ?? "",
    time:      existing?.time ? new Date(existing.time).toISOString().slice(0,16) : "",
    location:  existing?.location ?? "",
    nekathTime:existing?.nekathTime ?? "",
    notes:     existing?.notes ?? "",
    order:     existing?.order ?? nextOrder,
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const url = isEdit ? `/api/couple/events/${existing!.id}` : "/api/couple/events";
    const res = await fetch(url, { method:isEdit?"PATCH":"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...form,weddingId}) });
    const j   = await res.json(); setSaving(false);
    if (res.ok) onSaved(j.data.event);
  }

  return (
    <form onSubmit={submit}>
      <div className="db-event-presets">
        <span className="db-event-preset-lbl">Quick select:</span>
        {PRESETS.map(p => (
          <button key={p} type="button" className={`db-btn db-btn-sm ${form.title===p?"db-btn-primary":"db-btn-outline"}`}
            onClick={()=>setForm(f=>({...f,title:p}))}>{p}</button>
        ))}
      </div>
      <div className="db-form-grid">
        <div className="db-field"><label className="db-label">Event Name *</label><input className="db-input" required value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Poruwa Ceremony"/></div>
        <div className="db-field"><label className="db-label">Date & Time *</label><input className="db-input" type="datetime-local" required value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))}/></div>
        <div className="db-field db-form-full"><label className="db-label">Venue *</label><input className="db-input" required value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="Cinnamon Grand Ballroom, Colombo"/></div>
        <div className="db-field"><label className="db-label">Nekath Time <span className="db-hint">optional</span></label><input className="db-input" value={form.nekathTime} onChange={e=>setForm(f=>({...f,nekathTime:e.target.value}))} placeholder="9:47 AM"/></div>
        <div className="db-field"><label className="db-label">Notes <span className="db-hint">optional</span></label><input className="db-input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Additional info"/></div>
      </div>
      <div className="db-form-actions">
        <button type="button" className="db-btn db-btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="db-btn db-btn-primary" disabled={saving}>
          {saving ? <><span className="db-spinner"/>Saving…</> : isEdit ? "Save Changes" : "Add Event"}
        </button>
      </div>
    </form>
  );
}
