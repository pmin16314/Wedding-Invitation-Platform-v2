import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const { approved } = await req.json().catch(() => ({}));
  const m = await prisma.guestMoment.findFirst({ where:{id:(await params).id,weddingId:session.user.weddingId} });
  if (!m) return err("Not found", 404);
  const updated = await prisma.guestMoment.update({ where:{id:(await params).id}, data:{approved} });
  return ok({ moment:updated });
}
