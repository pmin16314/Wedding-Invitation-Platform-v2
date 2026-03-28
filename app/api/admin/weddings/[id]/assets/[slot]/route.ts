import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { revalidatePath } from "next/cache";
const SLOTS = ["CORNER_TOP_RIGHT","CORNER_BOTTOM_LEFT","BG_WASH","CORNER_TOP_LEFT","CORNER_BOTTOM_RIGHT","MONOGRAM","DIVIDER_FLOURISH"];
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; slot: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  if (!SLOTS.includes((await params).slot)) return err("Invalid slot", 400);
  const body = await req.json().catch(() => null);
  if (!body?.cloudinaryUrl) return err("Missing cloudinaryUrl", 400);
  const asset = await prisma.weddingAsset.upsert({
    where:{ weddingId_slot:{ weddingId:(await params).id, slot:(await params).slot as any } },
    create:{ weddingId:(await params).id, slot:(await params).slot as any, cloudinaryUrl:body.cloudinaryUrl, cloudinaryPublicId:body.cloudinaryPublicId, opacity:body.opacity??0.85, sizePercent:body.sizePercent??52, fileType:body.fileType??"PNG" },
    update:{ cloudinaryUrl:body.cloudinaryUrl, cloudinaryPublicId:body.cloudinaryPublicId, opacity:body.opacity??0.85, sizePercent:body.sizePercent??52, fileType:body.fileType??"PNG" },
  });
  const w = await prisma.wedding.findUnique({ where:{ id:(await params).id }, select:{ slug:true } });
  if (w) revalidatePath(`/${w.slug}`);
  return ok({ asset });
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; slot: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const body = await req.json().catch(() => ({}));
  const asset = await prisma.weddingAsset.update({ where:{ weddingId_slot:{ weddingId:(await params).id, slot:(await params).slot as any } }, data:{ opacity:body.opacity, sizePercent:body.sizePercent } });
  return ok({ asset });
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; slot: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  await prisma.weddingAsset.delete({ where:{ weddingId_slot:{ weddingId:(await params).id, slot:(await params).slot as any } } });
  return ok({ deleted: true });
}
