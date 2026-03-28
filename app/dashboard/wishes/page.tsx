import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import WishesClient from "./WishesClient";

export default async function WishesPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const wishes = await prisma.guestWish.findMany({
    where:{weddingId:session.user.weddingId}, orderBy:{createdAt:"desc"},
    include:{guest:{select:{name:true}}},
  });
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Wishes</h1></div>
      <WishesClient wishes={wishes.map(w=>({...w,createdAt:w.createdAt.toISOString()}))} />
    </div>
  );
}
