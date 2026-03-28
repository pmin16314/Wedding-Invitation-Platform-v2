import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "./AdminSidebar";
import { ToastProvider } from "./AdminUI";
import "./admin.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [unreadChat, newLeads] = await Promise.all([
    prisma.chatMessage.count({ where: { senderRole: "COUPLE", isRead: false } }),
    prisma.lead.count({ where: { status: "NEW" } }),
  ]);

  return (
    <ToastProvider>
      <div className="a-wrap">
        <AdminSidebar
          user={{ name: session.user.name ?? "Admin", email: session.user.email ?? "" }}
          unreadChat={unreadChat}
          newLeads={newLeads}
        />
        <main className="a-main">{children}</main>
      </div>
    </ToastProvider>
  );
}
