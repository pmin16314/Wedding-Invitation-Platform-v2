import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EventsClient from "./EventsClient";

export default async function EventsPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const [events, wedding] = await Promise.all([
    prisma.weddingEvent.findMany({ where:{weddingId:session.user.weddingId}, orderBy:{order:"asc"} }),
    prisma.wedding.findUnique({ where:{id:session.user.weddingId}, select:{id:true} }),
  ]);
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Events</h1></div>
      <EventsClient events={events.map(e=>({...e,time:e.time.toISOString(),createdAt:e.createdAt.toISOString()}))} weddingId={wedding?.id??""} />
    </div>
  );
}
