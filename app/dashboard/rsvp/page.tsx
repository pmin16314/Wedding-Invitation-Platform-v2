import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = { title: "RSVPs — Dashboard" };

export default async function RsvpPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");

  const [wedding, rsvps] = await Promise.all([
    prisma.wedding.findUnique({ where: { id: session.user.weddingId }, select: { package: true } }),
    prisma.rSVP.findMany({
      where: { weddingId: session.user.weddingId },
      include: { guest: { select: { name: true, inviteType: true, group: true } } },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const attending = rsvps.filter(r => r.attending);
  const declined  = rsvps.filter(r => !r.attending);
  const seats     = attending.reduce((s, r) => s + r.attendeeCount, 0);

  return (
    <div className="fade-in">
      <div className="db-page-top">
        <div className="db-page-header db-page-header-flush">
          <p className="db-page-label">Dashboard</p>
          <h1 className="db-page-title">RSVPs</h1>
        </div>
        {wedding?.package !== "BASIC" && (
          <a href="/api/couple/rsvp/export" className="db-btn db-btn-outline">↓ Export CSV</a>
        )}
      </div>

      {/* Summary */}
      <div className="db-stats-grid db-stats-mt">
        {[
          { label: "Attending", value: attending.length, sub: `${seats} total seats`, color: "var(--green)" },
          { label: "Declined",  value: declined.length,  sub: "not attending",         color: "var(--red)"   },
          { label: "Responses", value: rsvps.length,     sub: "total received",         color: undefined      },
        ].map(s => (
          <div key={s.label} className="db-stat-card">
            <div className="db-stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div>
            <div className="db-stat-label">{s.label}</div>
            <div className="db-stat-sub" style={s.color ? { color: s.color } : {}}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="db-card db-card-mt">
        <div className="db-table-wrap">
          <table className="db-table">
            <thead>
              <tr><th>Guest</th><th>Status</th><th>Seats</th><th>Meal</th><th>Message</th><th>Date</th></tr>
            </thead>
            <tbody>
              {rsvps.map(r => (
                <tr key={r.id}>
                  <td>
                    <div className="db-table-name-cell">{r.guest.name}</div>
                    {r.guest.group && <div className="db-table-sub-cell">{r.guest.group}</div>}
                  </td>
                  <td>
                    <span className={`db-badge ${r.attending ? "db-badge-attending" : "db-badge-declined"}`}>
                      {r.attending ? "✓ Attending" : "✗ Declined"}
                    </span>
                  </td>
                  <td className="db-table-soft">{r.attending ? r.attendeeCount : "—"}</td>
                  <td className="db-table-soft-sm">{r.mealPreference ?? "—"}</td>
                  <td className="db-table-soft-sm">
                    {r.message ? <span className="db-table-truncate">{r.message}</span> : "—"}
                  </td>
                  <td className="db-table-meta">
                    {new Date(r.submittedAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
              {rsvps.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="db-rsvp-empty">
                    <div className="db-rsvp-empty-icon">📬</div>
                    <div className="db-rsvp-empty-text">No RSVPs yet. Share your invitations to get responses.</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
