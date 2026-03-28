"use client";
import { useState } from "react";
import { useToast, ConfirmDialog } from "@/app/dashboard/DashboardUI";

interface Wish { id:string; guestName:string; message:string; approved:boolean; createdAt:string; }

export default function WishesClient({ wishes: initial }: { wishes: Wish[] }) {
  const [wishes, setWishes] = useState(initial);
  const pending  = wishes.filter(w => !w.approved);
  const approved = wishes.filter(w => w.approved);

  const [confirmId, setConfirmId] = useState<string|null>(null);
  const { show: showToast } = useToast();

  async function toggle(id: string, approved: boolean) {
    setWishes(ws => ws.map(w => w.id===id ? {...w,approved} : w));
    await fetch(`/api/couple/wishes/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({approved}) });
    showToast(approved ? "Wish approved" : "Wish unapproved");
  }
  async function del(id: string) {
    setWishes(ws => ws.filter(w => w.id!==id));
    await fetch(`/api/couple/wishes/${id}`, { method:"DELETE" });
    setConfirmId(null);
    showToast("Wish deleted");
  }

  return (
    <div className="db-wishes-wrap">
      {/* Pending */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Pending Approval</span>
          <span className="db-wish-count-badge">{pending.length}</span>
        </div>
        <div className="db-card-body-sm">
          {pending.length === 0
            ? <div className="db-wishes-empty">No pending wishes.</div>
            : pending.map((w, i) => (
              <div key={w.id} className="db-wish-row" style={{borderBottom: i<pending.length-1?"1px solid var(--ivory-border)":"none"}}>
                <div className="db-wish-body">
                  <div className="db-wish-name">{w.guestName}</div>
                  <div className="db-wish-msg">"{w.message}"</div>
                  <div className="db-wish-date">{new Date(w.createdAt).toLocaleDateString("en-GB")}</div>
                </div>
                <div className="db-wish-actions">
                  <button className="db-btn db-btn-sm db-btn-success" onClick={()=>toggle(w.id,true)}>✓ Approve</button>
                  <button className="db-btn db-btn-sm db-btn-danger" onClick={()=>setConfirmId(w.id)}>Delete</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Approved */}
      <div className="db-card">
        <div className="db-card-header"><span className="db-card-title">Approved Wishes</span></div>
        <div className="db-card-body-sm">
          {approved.length === 0
            ? <div className="db-wishes-empty">No approved wishes yet.</div>
            : approved.map((w, i) => (
              <div key={w.id} className="db-approved-row" style={{borderBottom: i<approved.length-1?"1px solid var(--ivory-border)":"none"}}>
                <div className="db-wish-body">
                  <div className="db-wish-name">{w.guestName}</div>
                  <div className="db-wish-msg">"{w.message}"</div>
                </div>
                <div className="db-wish-actions">
                  <button className="db-btn db-btn-sm db-btn-outline" style={{color:"var(--charcoal-mute)"}} onClick={()=>toggle(w.id,false)}>Unapprove</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <ConfirmDialog
        open={!!confirmId}
        title="Delete Wish"
        message="This will permanently delete this guest wish."
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmId && del(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
