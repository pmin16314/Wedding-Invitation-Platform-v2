import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { IconBell, IconChat, LetterIcon, PhotoIcon } from "@/components/icons";

export const metadata = { title: "Overview — Vowly Admin" };

const PACKAGE_PRICE: Record<string, number> = { BASIC: 3900, CLASSIC: 9900, PREMIUM: 21900 };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);

  const [
    totalWeddings, published, draft, archived, weddingsByPackage, recentWeddings,
    totalGuests, totalRsvps, attendingRsvps, rsvpLast30,
    leadsByStatus, leadsByPackage, leadsThisWeek, leadsLastWeek, recentLeads,
    totalPhotos, totalWishes, approvedWishes, totalMoments, totalChatMessages,
  ] = await Promise.all([
    prisma.wedding.count(),
    prisma.wedding.count({ where: { status: "PUBLISHED" } }),
    prisma.wedding.count({ where: { status: "DRAFT" } }),
    prisma.wedding.count({ where: { status: "ARCHIVED" } }),
    prisma.wedding.groupBy({ by: ["package"], _count: { id: true } }),
    prisma.wedding.findMany({
      take: 6, orderBy: { createdAt: "desc" },
      include: { content: true, theme: { select: { primaryColor: true } }, _count: { select: { guests: true, rsvps: true } } },
    }),
    prisma.guest.count(),
    prisma.rSVP.count(),
    prisma.rSVP.count({ where: { attending: true } }),
    prisma.rSVP.findMany({ where: { submittedAt: { gte: thirtyDaysAgo } }, select: { submittedAt: true }, orderBy: { submittedAt: "asc" } }),
    prisma.lead.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.lead.groupBy({ by: ["package"], _count: { id: true } }),
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: new Date(Date.now() - 14*24*60*60*1000), lt: sevenDaysAgo } } }),
    prisma.lead.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.galleryPhoto.count(),
    prisma.guestWish.count(),
    prisma.guestWish.count({ where: { approved: true } }),
    prisma.guestMoment.count(),
    prisma.chatMessage.count({ where: { senderRole: "COUPLE" } }),
  ]);

  const convertedLeads = await prisma.lead.findMany({ where: { status: "CONVERTED" }, select: { package: true } });
  const estimatedRevenue = convertedLeads.reduce((sum, l) => sum + (PACKAGE_PRICE[l.package] ?? 0), 0);

  const rsvpRate      = totalGuests > 0 ? Math.round((totalRsvps / totalGuests) * 100) : 0;
  const totalLeads    = leadsByStatus.reduce((s, l) => s + l._count.id, 0);
  const convertedCount = leadsByStatus.find(l => l.status === "CONVERTED")?._count.id ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;

  // RSVPs per day — last 14 days
  const rsvpByDay = (() => {
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days[d.toISOString().slice(0, 10)] = 0;
    }
    rsvpLast30.forEach(r => {
      const key = r.submittedAt.toISOString().slice(0, 10);
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  })();

  const funnelOrder = ["NEW", "CONTACTED", "PAID", "CONVERTED", "LOST"];
  const leadFunnel  = funnelOrder.map(s => ({ status: s, count: leadsByStatus.find(l => l.status === s)?._count.id ?? 0 }));
  const maxFunnelCount = Math.max(...leadFunnel.map(l => l.count), 1);

  const pkgOrder  = ["BASIC", "CLASSIC", "PREMIUM"];
  const pkgColors: Record<string, string> = { BASIC: "var(--charcoal-mute)", CLASSIC: "var(--gold)", PREMIUM: "var(--charcoal)" };
  const weddingPkg = pkgOrder.map(p => ({ pkg: p, count: weddingsByPackage.find(w => w.package === p)?._count.id ?? 0 }));
  const leadPkg    = pkgOrder.map(p => ({ pkg: p, count: leadsByPackage.find(l => l.package === p)?._count.id ?? 0 }));
  const maxPkg     = Math.max(...weddingPkg.map(p => p.count), 1);

  const leadTrend = leadsThisWeek > leadsLastWeek ? "up" : leadsThisWeek < leadsLastWeek ? "down" : "flat";

  return (
    <div className="a-page-scroll">
      <div className="fade-in">
        <div className="a-page-top">
          <div className="a-page-header">
            <p className="a-page-label">Platform</p>
            <h1 className="a-page-title">Overview</h1>
          </div>
          <div className="a-page-actions">
            <Link href="/admin/weddings/new" className="a-btn a-btn-primary">+ New Wedding</Link>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="a-stats-grid fade-up">
          {[
            { label: "Total Weddings",  value: totalWeddings,  sub: `${published} live · ${draft} drafts`,              color: undefined },
            { label: "Total Guests",    value: totalGuests,    sub: "across all weddings",                               color: undefined },
            { label: "RSVP Rate",       value: `${rsvpRate}%`, sub: `${totalRsvps} of ${totalGuests} responded`,        color: "var(--green)" },
            { label: "Lead Conversion", value: `${conversionRate}%`, sub: `${convertedCount} of ${totalLeads} converted`, color: "var(--gold)" },
            { label: "Est. Revenue",    value: `LKR ${(estimatedRevenue / 1000).toFixed(0)}k`, sub: "from converted leads", color: undefined },
            { label: "Couple Messages", value: totalChatMessages, sub: "sent by couples",                                color: undefined },
          ].map((s, i) => (
            <div key={s.label} className={`a-stat-card fade-up d${Math.min(i + 1, 5)}`}>
              <div className="a-stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div>
              <div className="a-stat-label">{s.label}</div>
              <div className="a-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Row 2: RSVP Activity + Lead Pipeline ── */}
        <div className="a-overview-row">

          {/* RSVP Activity */}
          <div className="a-card fade-up d1">
            <div className="a-card-header">
              <span className="a-card-title">RSVP Activity</span>
              <span className="a-card-header-meta">Last 14 days</span>
            </div>
            <div className="a-card-body">
              <div className="a-sparkline-bars" style={{ height: 80 }}>
                {rsvpByDay.map(({ date, count }) => {
                  const maxCount = Math.max(...rsvpByDay.map(d => d.count), 1);
                  const h = count === 0 ? 3 : Math.max((count / maxCount) * 72, 8);
                  const isToday = date === new Date().toISOString().slice(0, 10);
                  return (
                    <div key={date} title={`${date}: ${count} RSVPs`} style={{
                      flex: 1, height: `${h}px`,
                      background: isToday ? "var(--gold)" : count === 0 ? "var(--ivory-border)" : "var(--charcoal)",
                      borderRadius: "3px 3px 0 0", transition: "height .3s", cursor: "default",
                    }} />
                  );
                })}
              </div>
              <div className="a-sparkline-axis">
                <span>{rsvpByDay[0]?.date.slice(5)}</span>
                <span>{rsvpByDay[6]?.date.slice(5)}</span>
                <span>Today</span>
              </div>
              <div className="a-sparkline-stats">
                <div className="a-sparkline-stat">
                  <div className="a-sparkline-num">{attendingRsvps}</div>
                  <div className="a-sparkline-lbl">Attending</div>
                </div>
                <div className="a-sparkline-divider" />
                <div className="a-sparkline-stat">
                  <div className="a-sparkline-num">{totalRsvps - attendingRsvps}</div>
                  <div className="a-sparkline-lbl declined">Declined</div>
                </div>
                <div className="a-sparkline-divider" />
                <div className="a-sparkline-stat">
                  <div className="a-sparkline-num">{totalGuests - totalRsvps}</div>
                  <div className="a-sparkline-lbl">Pending</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Pipeline */}
          <div className="a-card fade-up d2">
            <div className="a-card-header">
              <span className="a-card-title">Lead Pipeline</span>
              <span className="a-card-header-meta" style={{ color: leadTrend === "up" ? "var(--green)" : leadTrend === "down" ? "var(--red)" : undefined }}>
                {leadTrend === "up" ? "↑" : leadTrend === "down" ? "↓" : "→"} {leadsThisWeek} this week
              </span>
            </div>
            <div className="a-card-body">
              {leadFunnel.map(({ status, count }) => (
                <div key={status} className="a-funnel-row">
                  <div className="a-funnel-row-head">
                    <span className="a-funnel-label">{status}</span>
                    <span className="a-funnel-count">{count}</span>
                  </div>
                  <div className="a-funnel-track">
                    <div style={{
                      height: "100%", borderRadius: 3, transition: "width .6s ease",
                      width: `${(count / maxFunnelCount) * 100}%`,
                      background: status === "CONVERTED" ? "var(--green)" : status === "LOST" ? "var(--red)" : status === "PAID" ? "var(--gold)" : "var(--charcoal)",
                    }} />
                  </div>
                </div>
              ))}
              <div className="a-funnel-footer">
                {[
                  { num: `${conversionRate}%`, lbl: "Conversion", color: "var(--gold)" },
                  { num: totalLeads,            lbl: "Total Leads", color: "var(--charcoal)" },
                  { num: convertedCount,        lbl: "Converted",   color: "var(--green)" },
                ].map(({ num, lbl, color }) => (
                  <div key={lbl} className="a-funnel-stat">
                    <div className="a-funnel-stat-num" style={{ color }}>{num}</div>
                    <div className="a-funnel-stat-lbl">{lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 3: Package Distribution + Engagement ── */}
        <div className="a-overview-row">

          {/* Package Distribution */}
          <div className="a-card fade-up d3">
            <div className="a-card-header">
              <span className="a-card-title">Package Distribution</span>
              <span className="a-card-header-meta" style={{ color: leadTrend === "up" ? "var(--green)" : leadTrend === "down" ? "var(--red)" : undefined }}>
                {leadTrend === "up" ? "↑" : leadTrend === "down" ? "↓" : "→"} {leadsThisWeek} this week
              </span>
            </div>
            <div className="a-card-body">
              {/* Weddings bars */}
              <div className="a-pkg-section">
                <div className="a-pkg-section-lbl">Weddings</div>
                {weddingPkg.map(({ pkg, count }) => (
                  <div key={pkg} className="a-pkg-row">
                    <div className="a-pkg-row-head">
                      <span className={`a-badge a-badge-${pkg.toLowerCase()}`}>{pkg}</span>
                      <span className="a-pkg-count">{count}</span>
                    </div>
                    <div className="a-pkg-track">
                      <div style={{ height: "100%", borderRadius: 3, width: `${(count / maxPkg) * 100}%`, background: pkgColors[pkg], transition: "width .6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom: leads list + revenue side by side */}
              <div className="a-pkg-bottom">
                <div className="a-pkg-bottom-leads">
                  <div className="a-pkg-section-lbl">Leads by Package Interest</div>
                  {leadPkg.map(({ pkg, count }) => (
                    <div key={pkg} className="a-pkg-leads-row">
                      <span className="a-pkg-leads-lbl">{pkg}</span>
                      <span className="a-pkg-leads-count">{count} leads</span>
                    </div>
                  ))}
                </div>
                <div className="a-pkg-revenue-box">
                  <div className="a-pkg-revenue-lbl">Estimated Revenue</div>
                  <div className="a-pkg-revenue-amt">LKR {estimatedRevenue.toLocaleString()}</div>
                  <div className="a-pkg-revenue-sub">from {convertedCount} converted leads</div>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement */}
          <div className="a-card fade-up d4">
            <div className="a-card-header"><span className="a-card-title">Engagement</span></div>
            <div className="a-card-body">
              {[
                { label: "Gallery Photos",  value: totalPhotos,       icon: <PhotoIcon />,  sub: "uploaded by couples" },
                { label: "Guest Wishes",    value: totalWishes,       icon: <LetterIcon />,  sub: `${approvedWishes} approved` },
                { label: "Guest Moments",   value: totalMoments,      icon: <IconBell />,  sub: "ceremony photos" },
              ].map(({ label, value, icon, sub }) => (
                <div key={label} className="a-engage-row">
                  <div className="a-engage-icon">{icon}</div>
                  <div className="a-engage-body">
                    <div className="a-engage-label">{label}</div>
                    <div className="a-engage-sub">{sub}</div>
                  </div>
                  <div className="a-engage-value">{value}</div>
                </div>
              ))}
              <div className="a-status-pills">
                {[
                  { label: "Published", count: published, color: "var(--green)" },
                  { label: "Draft",     count: draft,     color: "var(--charcoal-mute)" },
                  { label: "Archived",  count: archived,  color: "var(--ivory-border)" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="a-status-pill-item">
                    <div className="a-status-pill-num" style={{ color }}>{count}</div>
                    <div className="a-status-pill-lbl">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 4: Recent Weddings + Recent Leads ── */}
        <div className="a-overview-row-4">
          <div className="a-card fade-up d2">
            <div className="a-card-header">
              <span className="a-card-title">Recent Weddings</span>
              <Link href="/admin/weddings" className="a-btn a-btn-ghost a-btn-sm a-ml-auto">View all →</Link>
            </div>
            <div className="a-table-wrap">
              <table className="a-table">
                <thead><tr><th>Couple</th><th>Package</th><th>Status</th><th>Guests</th></tr></thead>
                <tbody>
                  {recentWeddings.map(w => (
                    <tr key={w.id}>
                      <td>
                        <Link href={`/admin/weddings/${w.id}`} className="a-no-underline">
                          <div className="a-table-name a-text-charcoal">
                            {w.content?.brideName && w.content?.groomName ? `${w.content.brideName} & ${w.content.groomName}` : w.slug}
                          </div>
                          <div className="a-table-sub">/{w.slug}</div>
                        </Link>
                      </td>
                      <td><span className={`a-badge a-badge-${w.package.toLowerCase()}`}>{w.package}</span></td>
                      <td><span className={`a-badge a-badge-${w.status.toLowerCase()}`}>{w.status}</span></td>
                      <td className="a-table-muted">{w._count.guests}</td>
                    </tr>
                  ))}
                  {recentWeddings.length === 0 && (
                    <tr><td colSpan={4} className="a-table-empty">No weddings yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="a-card fade-up d3">
            <div className="a-card-header">
              <span className="a-card-title">Recent Leads</span>
              <Link href="/admin/leads" className="a-btn a-btn-ghost a-btn-sm a-ml-auto">View all →</Link>
            </div>
            <div className="a-table-wrap">
              <table className="a-table">
                <thead><tr><th>Name</th><th>Package</th><th>Status</th></tr></thead>
                <tbody>
                  {recentLeads.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div className="a-table-name">{l.name}</div>
                        <div className="a-table-sub">{l.whatsapp}</div>
                      </td>
                      <td><span className={`a-badge a-badge-${l.package.toLowerCase()}`}>{l.package}</span></td>
                      <td><span className={`a-badge a-badge-${l.status.toLowerCase()}`}>{l.status}</span></td>
                    </tr>
                  ))}
                  {recentLeads.length === 0 && (
                    <tr><td colSpan={3} className="a-table-empty">No leads yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
