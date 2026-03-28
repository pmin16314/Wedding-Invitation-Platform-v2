import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const wedding = await prisma.wedding.findUnique({
    where:{id:session.user.weddingId},
    select:{rsvpDeadline:true,momentsUnlockTime:true,slug:true,status:true},
  });
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Settings</h1></div>
      <SettingsClient wedding={wedding?{...wedding,rsvpDeadline:wedding.rsvpDeadline?.toISOString()??null,momentsUnlockTime:wedding.momentsUnlockTime?.toISOString()??null}:null} />
    </div>
  );
}
