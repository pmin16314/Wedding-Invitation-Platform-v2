import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  const session = await auth();
  if (!session?.user?.weddingId) redirect("/login");
  const [photos, wedding] = await Promise.all([
    prisma.galleryPhoto.findMany({ where:{weddingId:session.user.weddingId}, orderBy:{order:"asc"} }),
    prisma.wedding.findUnique({ where:{id:session.user.weddingId}, select:{package:true} }),
  ]);
  const limit = wedding?.package==="BASIC"?10:wedding?.package==="CLASSIC"?30:9999;
  return (
    <div className="fade-in">
      <div className="db-page-header"><p className="db-page-label">Dashboard</p><h1 className="db-page-title">Gallery</h1><p style={{fontSize:13,color:"var(--charcoal-mute)",marginTop:4}}>{photos.length} / {limit===9999?"Unlimited":limit} photos</p></div>
      <GalleryClient photos={photos.map(p=>({...p,uploadedAt:p.uploadedAt.toISOString()}))} limit={limit} />
    </div>
  );
}
