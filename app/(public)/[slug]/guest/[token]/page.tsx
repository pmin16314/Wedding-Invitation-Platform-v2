import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvitationPage from "../../InvitationPage";

export default async function GuestInvitationPage({ params }: { params:{ slug:string; token:string } }) {
  const guest = await prisma.guest.findUnique({ where:{ token:params.token } });
  if (!guest || guest.weddingId === null) notFound();
  const wedding = await prisma.wedding.findUnique({
    where: { id: guest.weddingId },
    include: { content:true, theme:true, assets:true, events:{ orderBy:{ order:"asc" } }, galleryPhotos:{ orderBy:{ order:"asc" } }, wishes:{ where:{ approved:true }, orderBy:{ createdAt:"desc" } } },
  });
  if (!wedding || wedding.status !== "PUBLISHED" || wedding.slug !== (await params).slug) notFound();
  return <InvitationPage wedding={wedding} guestName={guest.name} guestToken={guest.token} />;
}
