import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GuestsClient from "./GuestsClient";

export default async function GuestsPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const [guests, wedding] = await Promise.all([
    prisma.guest.findMany({ where:{weddingId:session.user.weddingId}, include:{rsvp:true}, orderBy:{createdAt:"desc"} }),
    prisma.wedding.findUnique({ where:{id:session.user.weddingId}, select:{package:true,slug:true} }),
  ]);
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Guests</h1></div>
      <GuestsClient guests={guests.map(g=>({...g,createdAt:g.createdAt.toISOString(),lastSharedAt:g.lastSharedAt?.toISOString()??null,rsvp:g.rsvp?{...g.rsvp,submittedAt:g.rsvp.submittedAt.toISOString(),updatedAt:g.rsvp.updatedAt.toISOString()}:null}))} weddingPackage={wedding?.package??"BASIC"} weddingSlug={wedding?.slug??""} />
    </div>
  );
}
