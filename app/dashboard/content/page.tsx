import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ContentClient from "./ContentClient";

export default async function ContentPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const content = await prisma.weddingContent.findUnique({ where: { weddingId: session.user.weddingId } });
  const wedding = await prisma.wedding.findUnique({ where: { id: session.user.weddingId }, select: { rsvpDeadline:true,momentsUnlockTime:true } });
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Invitation Details</h1></div>
      <ContentClient content={content} wedding={wedding} />
    </div>
  );
}
