import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ShareClient from "./ShareClient";

export default async function SharePage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const [wedding, guests] = await Promise.all([
    prisma.wedding.findUnique({
      where:{id:session.user.weddingId},
      include:{ content:{select:{brideName:true,groomName:true,weddingDate:true,whatsappMessageTemplate:true}}, theme:{select:{primaryColor:true}} },
    }),
    prisma.guest.findMany({ where:{weddingId:session.user.weddingId}, include:{rsvp:{select:{attending:true}}}, orderBy:{createdAt:"asc"} }),
  ]);
  if (!wedding) redirect("/login");
  if (wedding.package === "BASIC") return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Share</h1></div>
      <div className="db-card"><div className="db-card-body">
        <div className="a-empty"><div className="a-empty-icon">🔒</div><div className="a-empty-title">Classic or Premium required</div><div className="a-empty-text">WhatsApp Guest Share with personalised messages is available on Classic and Premium packages. Contact support to upgrade.</div></div>
      </div></div>
    </div>
  );
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Share Invitations</h1></div>
      <ShareClient
        guests={guests.map(g=>({...g,createdAt:g.createdAt.toISOString(),lastSharedAt:g.lastSharedAt?.toISOString()??null,rsvp:g.rsvp?{attending:g.rsvp.attending}:null}))}
        template={wedding.content?.whatsappMessageTemplate??""}
        brideName={wedding.content?.brideName??""}
        groomName={wedding.content?.groomName??""}
        weddingDate={wedding.content?.weddingDate?.toISOString()??""}
        weddingSlug={wedding.slug}
        appUrl={appUrl}
      />
    </div>
  );
}
