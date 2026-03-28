import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvitationPage from "../InvitationPage";

export default async function PreviewPage({ params }: { params:{ slug:string } }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const wedding = await prisma.wedding.findUnique({
    where: { slug: (await params).slug },
    include: { content:true, theme:true, assets:true, events:{ orderBy:{ order:"asc" } }, galleryPhotos:{ orderBy:{ order:"asc" } }, wishes:{ where:{ approved:true }, orderBy:{ createdAt:"desc" } } },
  });
  if (!wedding) notFound();
  return <InvitationPage wedding={wedding} guestName={null} guestToken={null} isPreview />;
}
