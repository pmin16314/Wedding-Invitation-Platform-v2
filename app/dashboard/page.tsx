import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CountdownTimer from "./CountdownTimer";

export const metadata = { title: "Dashboard — Vowly Invites" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.weddingId) {
    return (
      <div className="fade-in db-no-wedding">
        <div className="db-no-wedding-icon">💍</div>
        <h2 className="db-no-wedding-title">No wedding set up yet</h2>
        <p className="db-no-wedding-text">Your wedding will be configured by the Vowly team.<br/>Contact support via the chat icon below.</p>
      </div>
    );
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: session.user.weddingId },
    include: {
      content: true, theme: true,
      _count: { select: { guests: true, rsvps: true, galleryPhotos: true } },
      rsvps: { take: 5, orderBy: { submittedAt: "desc" }, include: { guest: { select: { name: true } } } },
    },
  });
  if (!wedding) redirect("/login");

  const attending = await prisma.rSVP.count({ where: { weddingId: wedding.id, attending: true } });
  const declined  = await prisma.rSVP.count({ where: { weddingId: wedding.id, attending: false } });
  const responded = attending + declined;
  const total     = wedding._count.guests;

  const allGuests = await prisma.guest.findMany({ where: { weddingId: wedding.id }, select: { maxAttendees: true } });
  const totalInvitedSeats = allGuests.reduce((s, g) => s + g.maxAttendees, 0);
  const allRsvps  = await prisma.rSVP.findMany({ where: { weddingId: wedding.id, attending: true }, select: { attendeeCount: true } });
  const totalAttendingSeats = allRsvps.reduce((s, r) => s + r.attendeeCount, 0);

  const actions = [
    { href:"/dashboard/guests",  label:"Manage Guests",       icon:"◉", color:"#E8F5E9" },
    { href:"/dashboard/rsvp",    label:"View RSVPs",          icon:"◎", color:"#E3F2FD" },
    { href:"/dashboard/gallery", label:"Upload Photos",       icon:"▦", color:"#F3E5F5" },
    { href:"/dashboard/content", label:"Edit Wedding Details",icon:"✏", color:"#FFF3E0" },
  ];

  return (
    <div className="fade-in">
      <div className="db-page-header">
        <p className="db-page-label">Dashboard</p>
        <h1 className="db-page-title">
          {wedding.content?.brideName && wedding.content?.groomName
            ? `${wedding.content.brideName} & ${wedding.content.groomName}`
            : "Welcome"}
        </h1>
        {wedding.content?.weddingDate && (
          <p className="db-page-subtitle">
            {new Date(wedding.content.weddingDate).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="db-stats-grid fade-up">
        <div className="db-stat-card">
          <div className="db-stat-value">{totalInvitedSeats}</div>
          <div className="db-stat-label">Invited Seats</div>
          <div className="db-stat-sub">{total} guests</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-value" style={{color:"var(--green)"}}>{totalAttendingSeats}</div>
          <div className="db-stat-label">Attending Seats</div>
          <div className="db-stat-sub" style={{color:"var(--green)"}}>{attending} confirmed</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-value" style={{color:"var(--charcoal-mute)"}}>{total - responded}</div>
          <div className="db-stat-label">Pending RSVP</div>
          <div className="db-stat-sub">{total > 0 ? Math.round((responded/total)*100) : 0}% responded</div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-value">{wedding._count.galleryPhotos}</div>
          <div className="db-stat-label">Gallery Photos</div>
        </div>
      </div>

      <div className="db-overview-row">
        {/* Countdown */}
        {wedding.content?.weddingDate && (
          <div className="db-card fade-up d1">
            <div className="db-card-header">
              <span className="db-card-title">Countdown</span>
              <span className="db-card-meta">Until the big day</span>
            </div>
            <div className="db-card-body db-card-center">
              <CountdownTimer targetDate={wedding.content.weddingDate.toISOString()} />
            </div>
          </div>
        )}

        {/* RSVP summary */}
        <div className="db-card fade-up d2">
          <div className="db-card-header">
            <span className="db-card-title">RSVP Summary</span>
            <Link href="/dashboard/rsvp" className="db-btn db-btn-ghost db-btn-sm db-ml-auto">View all →</Link>
          </div>
          <div className="db-card-body">
            {total > 0 ? (
              <>
                <div className="db-rsvp-counts">
                  <span>{responded} of {total} responded</span>
                  <span>{attending} attending</span>
                </div>
                <div className="db-rsvp-bar">
                  <div className="db-rsvp-fill" style={{width:`${total > 0 ? (responded/total)*100 : 0}%`}}/>
                </div>
                <div className="db-rsvp-list">
                  {wedding.rsvps.slice(0,3).map(r=>(
                    <div key={r.id} className="db-rsvp-item">
                      <div className="db-rsvp-dot" style={{background:r.attending?"var(--green)":"var(--red)"}}/>
                      <span>{r.guest.name}</span>
                      <span className="db-rsvp-status">{r.attending?"Attending":"Declined"}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="db-empty-small">No RSVPs yet. Share your guest links to get started!</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="db-card fade-up d3">
        <div className="db-card-header"><span className="db-card-title">Quick Actions</span></div>
        <div className="db-card-body">
          <div className="db-action-grid">
            {actions.map(a => (
              <Link key={a.href} href={a.href} className="db-action-item">
                <div className="db-action-icon" style={{background:a.color,fontSize:16}}>{a.icon}</div>
                <span className="db-action-label">{a.label}</span>
                <span className="db-action-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
