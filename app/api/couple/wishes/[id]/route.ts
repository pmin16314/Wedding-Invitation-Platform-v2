import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ approved: z.boolean() });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err("Invalid", 422);
  const w = await prisma.guestWish.findFirst({ where:{ id:(await params).id, weddingId:session.user.weddingId } });
  if (!w) return err("Not found", 404);
  const wish = await prisma.guestWish.update({ where:{ id:(await params).id }, data:{ approved:p.data.approved } });
  return ok({ wish });
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const w = await prisma.guestWish.findFirst({ where:{ id:(await params).id, weddingId:session.user.weddingId } });
  if (!w) return err("Not found", 404);
  await prisma.guestWish.delete({ where:{ id:(await params).id } });
  return ok({ deleted: true });
}
