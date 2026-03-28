"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NewWeddingModal from "./NewWeddingModal";

interface Wedding {
  id: string; slug: string; package: string; status: string;
  createdAt: string; primaryColor: string;
  brideName: string; groomName: string;
  guestCount: number; rsvpCount: number; unreadChat: number;
}

function initials(bride: string, groom: string) {
  const first = (s: string) => s.trim()[0]?.toUpperCase() ?? "";
  return `${first(bride)}${first(groom)}` || "?";
}

export default function WeddingsClient({ weddings }: { weddings: Wedding[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  function handleCreated() {
    // Refresh server data after creation — modal stays open to show result
    router.refresh();
  }

  return (
    <div className="a-page-scroll"><div className="fade-in">
      <div className="a-page-top">
        <div>
          <p className="a-page-label">Platform</p>
          <h1 className="a-page-title">Wedding & Couples</h1>
        </div>
        <div className="a-page-actions">
          <button className="a-btn a-btn-primary" onClick={() => setModalOpen(true)}>
            + New Wedding
          </button>
        </div>
      </div>

      <div className="a-card fade-up">
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Couple</th>
                <th>Package</th>
                <th>Status</th>
                <th>Guests</th>
                <th>RSVPs</th>
                <th>Created</th>
                <th>Option</th>
              </tr>
            </thead>
            <tbody>
              {weddings.map(w => {
                const name = w.brideName && w.groomName
                  ? `${w.brideName} & ${w.groomName}` : w.slug;

                return (
                  <tr key={w.id}>
                    <td>
                      <div className="a-couple-cell">
                        <div className="a-couple-initials" style={{ background: w.primaryColor }}>
                          {initials(w.brideName, w.groomName)}
                        </div>
                        <div>
                          <div className="a-table-name">{name}</div>
                          <div className="a-table-sub">/{w.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`a-badge a-badge-${w.package.toLowerCase()}`}>{w.package}</span></td>
                    <td><span className={`a-badge a-badge-${w.status.toLowerCase()}`}>{w.status}</span></td>
                    <td className="a-table-muted">{w.guestCount}</td>
                    <td className="a-table-muted">{w.rsvpCount}</td>
                    <td className="a-table-muted">{new Date(w.createdAt).toLocaleDateString("en-GB")}</td>
                    <td>
                      <div className="a-table-actions">
                        <Link href={`/admin/weddings/${w.id}`} className="a-btn a-btn-sm a-btn-outline">Edit</Link>
                        {w.status === "PUBLISHED" && (
                          <a href={`/${w.slug}`} target="_blank" className="a-btn a-btn-sm a-btn-outline">View ↗</a>
                        )}
                        <Link
                          href={`/admin/chat?weddingId=${w.id}`}
                          className={`a-btn-chat${w.unreadChat > 0 ? " has-unread" : ""}`}
                          title={w.unreadChat > 0 ? `${w.unreadChat} unread` : "Open chat"}
                        >
                          <IconChat />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {weddings.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="a-empty">
                    <div className="a-empty-icon">💍</div>
                    <div className="a-empty-title">No weddings yet</div>
                    <div className="a-empty-text">Create your first wedding to get started.</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewWeddingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div></div>
  );
}

function IconChat() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l2 2 2-2h5a1 1 0 001-1V3a1 1 0 00-1-1z"/>
    </svg>
  );
}
