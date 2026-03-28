import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvitationPage from "./InvitationPage";

export const revalidate = 60;

export default async function PublicInvitationPage({ params, searchParams }: { params:{slug:string}; searchParams:{[k:string]:string} }) {
  const wedding = await prisma.wedding.findUnique({
    where: { slug: (await params).slug },
    include: { content:true, theme:true, assets:true, events:{ orderBy:{ order:"asc" } }, galleryPhotos:{ orderBy:{ order:"asc" } }, wishes:{ where:{ approved:true }, orderBy:{ createdAt:"desc" } } },
  });
  if (!wedding || wedding.status === "DRAFT") notFound();
  return <InvitationPage wedding={wedding} guestName={null} guestToken={null} />;
}
