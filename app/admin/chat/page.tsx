import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminChatClient from "./AdminChatClient";

export const metadata = { title: "Chat Inbox — Vowly Admin" };

export default async function AdminChatPage({ searchParams }: { searchParams: Promise<{ weddingId?: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const { weddingId } = await searchParams;

  const weddings = await prisma.wedding.findMany({
    include: {
      content: true,
      chatMessages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { chatMessages: { where: { senderRole: "COUPLE", isRead: false } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="a-chat-page">
      <div className="a-chat-page-header">
        <p className="a-page-label">Platform</p>
        <h1 className="a-page-title">Chat Inbox</h1>
      </div>
      <AdminChatClient initialWeddingId={weddingId} weddings={weddings.map(w => ({
        id:            w.id,
        slug:          w.slug,
        name:          w.content?.brideName && w.content?.groomName
                         ? `${w.content.brideName} & ${w.content.groomName}` : w.slug,
        lastMessage:   w.chatMessages[0]?.content ?? null,
        lastMessageAt: w.chatMessages[0]?.createdAt.toISOString() ?? null,
        unreadCount:   w._count.chatMessages,
        status:        w.status,
        package:       w.package,
      }))} />
    </div>
  );
}
