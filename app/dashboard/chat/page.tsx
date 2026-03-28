import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CoupleChatClient from "./CoupleChatClient";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const messages = await prisma.chatMessage.findMany({
    where:{weddingId:session.user.weddingId}, orderBy:{createdAt:"asc"},
  });
  await prisma.chatMessage.updateMany({
    where:{weddingId:session.user.weddingId,senderRole:"ADMIN",isRead:false},
    data:{isRead:true,readAt:new Date()},
  });
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Support Chat</h1></div>
      <CoupleChatClient messages={messages.map(m=>({...m,createdAt:m.createdAt.toISOString(),readAt:m.readAt?.toISOString()??null}))} weddingId={session.user.weddingId} primaryColor={""} />
    </div>
  );
}
