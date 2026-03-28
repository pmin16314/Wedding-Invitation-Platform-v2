"use client";
import { useState } from "react";
interface W { slug:string;status:string;rsvpDeadline:string|null;momentsUnlockTime:string|null; }
export default function SettingsClient({ wedding }: { wedding:W|null }) {
  const [rsvpDeadline,setRsvpDeadline]=useState(wedding?.rsvpDeadline?new Date(wedding.rsvpDeadline).toISOString().slice(0,16):"");
  const [unlockTime,setUnlockTime]=useState(wedding?.momentsUnlockTime?new Date(wedding.momentsUnlockTime).toISOString().slice(0,16):"");
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const appUrl=process.env.NEXT_PUBLIC_APP_URL??"http://localhost:3000";

  async function save(e:React.FormEvent){
    e.preventDefault();setSaving(true);
    await fetch("/api/couple/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({rsvpDeadline:rsvpDeadline||null,momentsUnlockTime:unlockTime||null})});
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500);
  }
  return (
    <div className="db-share-panel db-panel-narrow">
      <form onSubmit={save}>
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">RSVP & Moments</span>
            {saved&&<span className="db-saved-msg">✓ Saved</span>}
          </div>
          <div className="db-card-body">
            <div className="db-form-grid">
              <div className="db-field db-form-full">
                <label className="db-label">RSVP Deadline</label>
                <input className="db-input" type="datetime-local" value={rsvpDeadline} onChange={e=>setRsvpDeadline(e.target.value)}/>
                <span className="db-hint">Guests cannot RSVP after this date and time.</span>
              </div>
              <div className="db-field db-form-full">
                <label className="db-label">Guest Moments Unlock Time</label>
                <input className="db-input" type="datetime-local" value={unlockTime} onChange={e=>setUnlockTime(e.target.value)}/>
                <span className="db-hint">Guests can upload ceremony photos after this time.</span>
              </div>
            </div>
            <button type="submit" className="db-btn db-btn-primary db-mt-4" disabled={saving}>
              {saving?<><span className="db-spinner"/>Saving…</>:"Save Settings"}
            </button>
          </div>
        </div>
      </form>

      {wedding && (
        <div className="db-card">
          <div className="db-card-header"><span className="db-card-title">Your Invitation</span></div>
          <div className="db-card-body">
            {[
              {label:"Invitation URL",value:`${appUrl}/${wedding.slug}`},
              {label:"Couple Login",  value:`${appUrl}/${wedding.slug}/couple-login`},
              {label:"Status",        value:wedding.status},
            ].map(({label,value})=>(
              <div key={label} className="db-info-row">
                <span className="db-info-label">{label}</span>
                <span className="db-info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
