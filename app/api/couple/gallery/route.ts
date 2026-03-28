import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, signCloudinary } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const photos = await prisma.galleryPhoto.findMany({
    where: { weddingId: session.user.weddingId },
    orderBy: { order: "asc" },
  });
  return ok({ photos });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const w = await prisma.wedding.findUnique({ where:{ id:session.user.weddingId }, select:{ slug:true, package:true } });
  if (!w) return err("Not found", 404);
  const limit = w.package==="BASIC"?10:w.package==="CLASSIC"?30:9999;
  const count = await prisma.galleryPhoto.count({ where:{ weddingId:session.user.weddingId } });
  if (count >= limit) return err(`Gallery limit reached (${limit} photos)`, 400);
  const fd = await req.formData();
  const file = fd.get("file") as File | null;
  if (!file) return err("No file", 400);
  if (file.size > 10*1024*1024) return err("File too large (max 10 MB)", 400);
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) return err("Invalid file type", 400);
  if (!process.env.CLOUDINARY_CLOUD_NAME) return err("Cloudinary not configured", 503);
  const sig = signCloudinary(`vowly/${w.slug}/gallery`);
  const fd2 = new FormData();
  fd2.append("file", file); fd2.append("signature", sig.signature);
  fd2.append("timestamp", String(sig.timestamp)); fd2.append("api_key", sig.apiKey);
  fd2.append("folder", sig.folder);
  const r = await (await fetch(sig.uploadUrl, { method:"POST", body:fd2 })).json();
  if (!r.secure_url) return err("Upload failed", 500);
  const agg = await prisma.galleryPhoto.aggregate({ where:{ weddingId:session.user.weddingId }, _max:{ order:true } });
  const photo = await prisma.galleryPhoto.create({ data:{ weddingId:session.user.weddingId!, url:r.secure_url, publicId:r.public_id, order:(agg._max.order??0)+1 } });
  return ok({ photo }, 201);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const { id } = await req.json().catch(() => ({}));
  const photo = await prisma.galleryPhoto.findFirst({ where:{ id, weddingId:session.user.weddingId } });
  if (!photo) return err("Not found", 404);
  await prisma.galleryPhoto.delete({ where:{ id } });
  return ok({ deleted: true });
}
