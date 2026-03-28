"use client";
import { useState } from "react";
import "./invitation.css";

interface Theme { primaryColor:string; accentColor:string; bgTint:string; scriptFont:string; capsFont:string; bodyFont:string; }
interface Asset { slot:string; cloudinaryUrl:string; opacity:number; sizePercent:number; fileType:string; }
interface WeddingData {
  id:string; slug:string; status:string; package:string; sectionOrder:any;
  content:{ brideName:string; groomName:string; weddingDate:string|null; venue:string; venueAddress:string; googleMapsUrl:string; loveStory:string; dressCode:string; specialNote:string; }|null;
  theme:Theme|null;
  assets:Asset[];
  events:{ id:string; title:string; time:string; location:string; nekathTime:string|null; notes:string|null; }[];
  galleryPhotos:{ id:string; url:string; caption:string|null; }[];
  wishes:{ id:string; guestName:string; message:string; }[];
}

export default function InvitationPage({ wedding, guestName, guestToken, isPreview=false }:{ wedding:WeddingData; guestName:string|null; guestToken:string|null; isPreview?:boolean }) {
  const [rsvpStep,setRsvpStep]=useState<"form"|"done">("form");
  const [rsvpForm,setRsvpForm]=useState({ attending:"yes", attendeeCount:1, mealPreference:"", dietaryNotes:"", message:"" });
  const [rsvpLoading,setRsvpLoading]=useState(false);

  const t = wedding.theme;
  const c = wedding.content;
  const sections: string[] = Array.isArray(wedding.sectionOrder) ? wedding.sectionOrder : ["hero","love_story","events","gallery","rsvp","wishes"];

  const css = t ? `
    :root {
      --inv-primary:    ${t.primaryColor};
      --inv-accent:     ${t.accentColor};
      --inv-bg:         ${t.bgTint};
      --inv-script:     '${t.scriptFont}', Georgia, serif;
      --inv-caps:       '${t.capsFont}', serif;
      --inv-body:       '${t.bodyFont}', sans-serif;
    }
    @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(t.scriptFont).replace(/%20/g,"+")}:ital,wght@0,300;0,400;0,500;1,300;1,400&family=${encodeURIComponent(t.capsFont).replace(/%20/g,"+")}:wght@400;500&family=${encodeURIComponent(t.bodyFont).replace(/%20/g,"+")}:wght@300;400;500&display=swap');
  ` : "";

  const assetMap: Record<string,Asset> = {};
  wedding.assets.forEach(a => assetMap[a.slot] = a);

  async function submitRsvp(e:React.FormEvent){
    e.preventDefault();
    if(!guestToken)return;
    setRsvpLoading(true);
    await fetch("/api/rsvp",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ token:guestToken, attending:rsvpForm.attending==="yes", attendeeCount:rsvpForm.attendeeCount, mealPreference:rsvpForm.mealPreference||undefined, dietaryNotes:rsvpForm.dietaryNotes||undefined, message:rsvpForm.message||undefined }) });
    setRsvpLoading(false);
    setRsvpStep("done");
  }

  return (
    <div className="inv-wrap" style={t ? { background: t.bgTint } : {}}>
      <style dangerouslySetInnerHTML={{ __html: css }}/>
      {/* Fixed asset layers */}
      {assetMap.BG_WASH&&<img src={assetMap.BG_WASH.cloudinaryUrl} className="inv-asset inv-bg-wash" alt="" style={{opacity:assetMap.BG_WASH.opacity}}/>}
      {assetMap.CORNER_TOP_RIGHT&&<img src={assetMap.CORNER_TOP_RIGHT.cloudinaryUrl} className="inv-asset inv-corner-tr" alt="" style={{opacity:assetMap.CORNER_TOP_RIGHT.opacity,width:`${assetMap.CORNER_TOP_RIGHT.sizePercent}%`}}/>}
      {assetMap.CORNER_BOTTOM_LEFT&&<img src={assetMap.CORNER_BOTTOM_LEFT.cloudinaryUrl} className="inv-asset inv-corner-bl" alt="" style={{opacity:assetMap.CORNER_BOTTOM_LEFT.opacity,width:`${assetMap.CORNER_BOTTOM_LEFT.sizePercent}%`}}/>}
      {assetMap.CORNER_TOP_LEFT&&<img src={assetMap.CORNER_TOP_LEFT.cloudinaryUrl} className="inv-asset inv-corner-tl" alt="" style={{opacity:assetMap.CORNER_TOP_LEFT.opacity,width:`${assetMap.CORNER_TOP_LEFT.sizePercent}%`}}/>}
      {assetMap.CORNER_BOTTOM_RIGHT&&<img src={assetMap.CORNER_BOTTOM_RIGHT.cloudinaryUrl} className="inv-asset inv-corner-br" alt="" style={{opacity:assetMap.CORNER_BOTTOM_RIGHT.opacity,width:`${assetMap.CORNER_BOTTOM_RIGHT.sizePercent}%`}}/>}

      {isPreview&&<div className="inv-preview-bar">Preview Mode — Not visible to guests</div>}

      {guestName&&<div className="inv-greeting">Dear <em>{guestName}</em>,</div>}

      {sections.map(section => {
        if (section === "hero") return (
          <section key="hero" className="inv-section inv-hero">
            {assetMap.MONOGRAM&&<img src={assetMap.MONOGRAM.cloudinaryUrl} className="inv-monogram" alt="" style={{opacity:assetMap.MONOGRAM.opacity}}/>}
            <p className="inv-eyebrow">Together with their families</p>
            <h1 className="inv-names">{c?.brideName??""}<br/><span className="inv-ampersand">&</span><br/>{c?.groomName??""}</h1>
            <div className="inv-divider"><span>✦</span></div>
            {c?.weddingDate&&<p className="inv-date">{new Date(c.weddingDate).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>}
            {c?.venue&&<p className="inv-venue">{c.venue}</p>}
            {c?.venueAddress&&<p className="inv-venue-addr">{c.venueAddress}</p>}
            {c?.googleMapsUrl&&<a href={c.googleMapsUrl} target="_blank" rel="noopener" className="inv-maps-link">View on Maps →</a>}
          </section>
        );
        if (section === "love_story" && c?.loveStory) return (
          <section key="love_story" className="inv-section">
            <p className="inv-section-label">Our Story</p>
            <div className="inv-divider-thin"/>
            <p className="inv-body-text">{c.loveStory}</p>
          </section>
        );
        if (section === "events" && wedding.events.length > 0) return (
          <section key="events" className="inv-section">
            <p className="inv-section-label">The Day</p>
            <div className="inv-divider-thin"/>
            <div className="inv-events">
              {wedding.events.map(ev=>(
                <div key={ev.id} className="inv-event">
                  <h3 className="inv-event-title">{ev.title}</h3>
                  <p className="inv-event-time">{new Date(ev.time).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})} · {new Date(ev.time).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</p>
                  {ev.nekathTime&&<p className="inv-event-nekath">✦ Auspicious time: {ev.nekathTime}</p>}
                  <p className="inv-event-location">{ev.location}</p>
                  {ev.notes&&<p className="inv-event-notes">{ev.notes}</p>}
                </div>
              ))}
            </div>
            {assetMap.DIVIDER_FLOURISH&&<img src={assetMap.DIVIDER_FLOURISH.cloudinaryUrl} className="inv-flourish" alt="" style={{opacity:assetMap.DIVIDER_FLOURISH.opacity}}/>}
          </section>
        );
        if (section === "gallery" && wedding.galleryPhotos.length > 0) return (
          <section key="gallery" className="inv-section">
            <p className="inv-section-label">Gallery</p>
            <div className="inv-divider-thin"/>
            <div className="inv-gallery">
              {wedding.galleryPhotos.map(p=>(
                <div key={p.id} className="inv-gallery-item">
                  <img src={p.url} alt={p.caption??""} className="inv-gallery-img"/>
                </div>
              ))}
            </div>
          </section>
        );
        if (section === "rsvp") return (
          <section key="rsvp" className="inv-section inv-rsvp-section">
            <p className="inv-section-label">RSVP</p>
            <div className="inv-divider-thin"/>
            {c?.dressCode&&<p className="inv-dress-code">Dress code: {c.dressCode}</p>}
            {c?.specialNote&&<p className="inv-special-note">{c.specialNote}</p>}
            {!guestToken ? (
              <div className="inv-rsvp-note">Please use your personal invitation link to RSVP.</div>
            ) : rsvpStep === "done" ? (
              <div className="inv-rsvp-done"><div className="inv-rsvp-done-icon">✓</div><p>Thank you for your response!</p></div>
            ) : (
              <form className="inv-rsvp-form" onSubmit={submitRsvp}>
                <div className="inv-rsvp-field">
                  <label className="inv-rsvp-label">Will you attend?</label>
                  <div className="inv-rsvp-options">
                    {[{v:"yes",l:"✓  Joyfully accept"},{v:"no",l:"✗  Regretfully decline"}].map(o=>(
                      <label key={o.v} className={`inv-rsvp-option${rsvpForm.attending===o.v?" selected":""}`}>
                        <input type="radio" name="attending" value={o.v} checked={rsvpForm.attending===o.v} onChange={e=>setRsvpForm(f=>({...f,attending:e.target.value}))} style={{display:"none"}}/>
                        {o.l}
                      </label>
                    ))}
                  </div>
                </div>
                {rsvpForm.attending==="yes"&&<>
                  <div className="inv-rsvp-field">
                    <label className="inv-rsvp-label">Number of guests attending</label>
                    <input className="inv-rsvp-input" type="number" min={1} max={6} value={rsvpForm.attendeeCount} onChange={e=>setRsvpForm(f=>({...f,attendeeCount:parseInt(e.target.value)}))}/>
                  </div>
                  <div className="inv-rsvp-field">
                    <label className="inv-rsvp-label">Meal preference</label>
                    <select className="inv-rsvp-input" value={rsvpForm.mealPreference} onChange={e=>setRsvpForm(f=>({...f,mealPreference:e.target.value}))}>
                      <option value="">No preference</option><option value="Vegetarian">Vegetarian</option><option value="Non-Veg">Non-Veg</option><option value="Other">Other</option>
                    </select>
                  </div>
                </>}
                <div className="inv-rsvp-field">
                  <label className="inv-rsvp-label">Leave a message <span style={{opacity:.6,fontSize:11}}>(optional)</span></label>
                  <textarea className="inv-rsvp-input inv-rsvp-textarea" value={rsvpForm.message} onChange={e=>setRsvpForm(f=>({...f,message:e.target.value}))} placeholder="Your kind message…"/>
                </div>
                <button type="submit" className="inv-rsvp-submit" disabled={rsvpLoading}>{rsvpLoading?"Sending…":"Send RSVP"}</button>
              </form>
            )}
          </section>
        );
        if (section === "wishes" && wedding.wishes.length > 0) return (
          <section key="wishes" className="inv-section">
            <p className="inv-section-label">Wishes</p>
            <div className="inv-divider-thin"/>
            <div className="inv-wishes">
              {wedding.wishes.map(w=>(
                <div key={w.id} className="inv-wish">
                  <p className="inv-wish-text">"{w.message}"</p>
                  <p className="inv-wish-name">— {w.guestName}</p>
                </div>
              ))}
            </div>
          </section>
        );
        return null;
      })}

      <footer className="inv-footer">
        <div className="inv-footer-mark">✦</div>
        <p className="inv-footer-text">Created with Vowly Invites</p>
      </footer>
    </div>
  );
}
