"use client";
import { useState, useRef } from "react";
import { useToast, ConfirmDialog } from "@/app/dashboard/DashboardUI";

interface Photo { id:string;url:string;publicId:string;caption:string|null;order:number; }

export default function GalleryClient({ photos:init, limit }: { photos:Photo[];limit:number }) {
  const [photos, setPhotos] = useState(init);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [confirmId, setConfirmId] = useState<string|null>(null);
  const { show: showToast } = useToast();

  async function upload(file:File) {
    if (photos.length >= limit) { showToast(`Photo limit reached (${limit} photos for your package)`, "error"); return; }
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/couple/gallery",{method:"POST",body:fd});
    const j = await res.json(); setUploading(false);
    if(j.ok) { setPhotos(ps=>[...ps,j.data.photo]); showToast("Photo uploaded"); }
    else showToast(j.error ?? "Upload failed", "error");
  }

  async function del(id:string) {
    await fetch("/api/couple/gallery",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    setPhotos(ps=>ps.filter(p=>p.id!==id));
    setConfirmId(null);
    showToast("Photo removed");
  }

  return (
    <div>
      <div className="db-gallery-grid">
        {/* Upload tile */}
        <label className="db-gallery-upload" style={{cursor:uploading?"not-allowed":"pointer",opacity:photos.length>=limit?.5:1}}>
          {uploading ? (
            <><div className="db-spinner"/><span className="db-gallery-text">Uploading…</span></>
          ) : (
            <><span className="db-gallery-icon">+</span><span className="db-gallery-text">Upload photo</span></>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}} disabled={uploading||photos.length>=limit}
            onChange={e=>{const f=e.target.files?.[0];if(f)upload(f);e.target.value="";}}/>
        </label>

        {photos.map(p=>(
          <div key={p.id} className="db-gallery-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption??""} className="db-gallery-img"/>
            <div className="db-gallery-overlay">
              <button onClick={()=>setConfirmId(p.id)} className="db-gallery-del-btn">✕</button>
            </div>
          </div>
        ))}
      </div>

      {photos.length===0&&!uploading&&(
        <div className="db-gallery-empty">
          <div className="db-gallery-empty-icon">🖼</div>
          <div className="db-gallery-empty-text">No photos yet. Click the upload tile above to add your first photo.</div>
        </div>
      )}
    </div>
  );
}
