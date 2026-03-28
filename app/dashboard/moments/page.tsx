import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MomentsClient from "./MomentsClient";

export default async function MomentsPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const [moments, wedding] = await Promise.all([
    prisma.guestMoment.findMany({ where:{weddingId:session.user.weddingId}, orderBy:{uploadedAt:"desc"}, include:{guest:{select:{name:true}}} }),
    prisma.wedding.findUnique({ where:{id:session.user.weddingId}, select:{package:true,momentsUnlockTime:true} }),
  ]);
  if (wedding?.package === "BASIC") redirect("/dashboard");
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Guest Moments</h1></div>
      <MomentsClient moments={moments.map(m=>({...m,uploadedAt:m.uploadedAt.toISOString(),guestName:m.guest.name}))} />
    </div>
  );
}
