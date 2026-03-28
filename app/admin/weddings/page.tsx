import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WeddingsClient from "./WeddingsClient";

export const metadata = { title: "Weddings — Vowly Admin" };

export default async function WeddingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const weddings = await prisma.wedding.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      content: true,
      theme:  { select: { primaryColor: true } },
      couple: { select: { email: true, username: true } },
      _count: { select: {
        guests: true,
        rsvps: true,
        chatMessages: { where: { senderRole: "COUPLE", isRead: false } },
      }},
    },
  });

  return (
    <WeddingsClient weddings={weddings.map(w => ({
      id:          w.id,
      slug:        w.slug,
      package:     w.package,
      status:      w.status,
      createdAt:   w.createdAt.toISOString(),
      primaryColor:w.theme?.primaryColor ?? "#C9606A",
      brideName:   w.content?.brideName ?? "",
      groomName:   w.content?.groomName ?? "",
      guestCount:  w._count.guests,
      rsvpCount:   w._count.rsvps,
      unreadChat:  w._count.chatMessages,
    }))} />
  );
}
