"use client";
import { useState } from "react";

interface Moment { id:string; url:string; guestName:string; approved:boolean; }

export default function MomentsClient({ moments: initial }: { moments: Moment[] }) {
  const [moments, setMoments] = useState(initial);

  async function toggle(id: string, approved: boolean) {
    setMoments(ms => ms.map(m => m.id===id ? {...m,approved} : m));
    await fetch(`/api/couple/moments/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({approved}) });
  }

  if (moments.length === 0) return (
    <div className="db-card">
      <div className="db-card-body">
        <div className="db-moments-empty">
          <div className="db-moments-empty-icon">📷</div>
          <div className="db-moments-empty-text">No guest photos yet. Guests can upload moments after the unlock time you set in Settings.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="db-gallery-grid">
      {moments.map(m => (
        <div key={m.id} className="db-gallery-item" style={{opacity:m.approved?1:.6}}>
          <img src={m.url} alt={m.guestName} className="db-gallery-img"/>
          <div className="db-gallery-overlay">
            <div className="db-moment-overlay">
              <div className="db-moment-guest">{m.guestName}</div>
              <button className="db-moment-toggle"
                style={{background:m.approved?"rgba(192,57,43,.9)":"rgba(74,124,89,.9)"}}
                onClick={()=>toggle(m.id,!m.approved)}>
                {m.approved?"Unapprove":"Approve"}
              </button>
            </div>
          </div>
          {!m.approved && <div className="db-moment-pending">Pending</div>}
        </div>
      ))}
    </div>
  );
}
