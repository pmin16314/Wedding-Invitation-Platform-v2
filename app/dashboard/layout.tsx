import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "./DashboardSidebar";
import "./dashboard.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [wedding, unreadChat] = await Promise.all([
    session.user.weddingId ? prisma.wedding.findUnique({
      where: { id: session.user.weddingId },
      include: { content: true, theme: true },
    }) : null,
    session.user.weddingId ? prisma.chatMessage.count({
      where: { weddingId: session.user.weddingId, senderRole: { not: "COUPLE" }, isRead: false }
    }) : 0,
  ]);

  return (
    <div className="db-wrap">
      <DashboardSidebar
        user={{ name: session.user.name ?? "Couple", email: session.user.email ?? "" }}
        unreadChat={unreadChat}
        wedding={wedding ? {
          slug: wedding.slug, status: wedding.status,
          brideName: wedding.content?.brideName ?? "",
          groomName: wedding.content?.groomName ?? "",
          primaryColor: wedding.theme?.primaryColor ?? "#C9A84C",
        } : null}
      />
      <main className="db-main">{children}</main>
    </div>
  );
}
