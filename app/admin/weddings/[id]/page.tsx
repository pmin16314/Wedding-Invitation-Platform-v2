import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import WeddingEditor from "./WeddingEditor";

export default async function WeddingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const w = await prisma.wedding.findUnique({
    where: { id: (await params).id },
    include: {
      content: true, theme: true, assets: true,
      events: { orderBy: { order: "asc" } },
      couple: true,
      _count: { select: { guests: true, rsvps: true, galleryPhotos: true } },
    },
  });
  if (!w) notFound();

  const name = w.content?.brideName && w.content?.groomName
    ? `${w.content.brideName} & ${w.content.groomName}` : w.slug;

  return (
    <div className="a-page-scroll"><div className="fade-in">
      <div className="a-editor-page-top">
        <div>
          <p className="a-breadcrumb">
            <Link href="/admin">Platform</Link> › <Link href="/admin/weddings">Weddings</Link> › {name}
          </p>
          <h1 className="a-page-title">{name}</h1>
          <div className="a-editor-slug-row">
            <code className="a-editor-slug-code">/{w.slug}</code>
            <span className={`a-badge a-badge-${w.status.toLowerCase()}`}>{w.status}</span>
            <span className={`a-badge a-badge-${w.package.toLowerCase()}`}>{w.package}</span>
            {w.status === "PUBLISHED" && (
              <a href={`/${w.slug}`} target="_blank" className="a-btn a-btn-sm a-btn-ghost">View invitation ↗</a>
            )}
          </div>
        </div>
      </div>

      <WeddingEditor wedding={{
        id: w.id, slug: w.slug, status: w.status, package: w.package,
        sectionOrder: w.sectionOrder as string[],
        couple: { username: w.couple.username, email: w.couple.email ?? null, name: w.couple.name, createdAt: w.couple.createdAt.toISOString() },
        content: w.content ? {
          brideName: w.content.brideName, groomName: w.content.groomName,
          brideParents: w.content.brideParents, groomParents: w.content.groomParents,
          bridePhone: w.content.bridePhone, groomPhone: w.content.groomPhone,
          weddingDate: w.content.weddingDate?.toISOString() ?? null,
          venue: w.content.venue, subVenue: w.content.subVenue,
          venueAddress: w.content.venueAddress,
          googleMapsUrl: w.content.googleMapsUrl,
          preInvitationText: w.content.preInvitationText,
          invitationLine: w.content.invitationLine,
          loveStory: w.content.loveStory, dressCode: w.content.dressCode,
          religiousCeremony: w.content.religiousCeremony,
          postCeremonyNote: w.content.postCeremonyNote,
          specialNote: w.content.specialNote,
        } : null,
        theme: w.theme ? {
          primaryColor: w.theme.primaryColor, accentColor: w.theme.accentColor,
          bgTint: w.theme.bgTint, scriptFont: w.theme.scriptFont,
          capsFont: w.theme.capsFont, bodyFont: w.theme.bodyFont,
        } : null,
        assets: w.assets.map(a => ({ id:a.id, slot:a.slot, cloudinaryUrl:a.cloudinaryUrl, cloudinaryPublicId:a.cloudinaryPublicId, opacity:a.opacity, sizePercent:a.sizePercent, fileType:a.fileType })),
        events: w.events.map(e => ({ id:e.id, title:e.title, time:e.time.toISOString(), location:e.location, nekathTime:e.nekathTime??null, notes:e.notes??null, order:e.order })),
        guestCount: w._count.guests, rsvpCount: w._count.rsvps, photoCount: w._count.galleryPhotos,
      }} />
    </div></div>
  );
}
