import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ guestIds:z.array(z.string()).min(1).max(500), shareStatus:z.enum(["NOT_SHARED","COPIED","WA_OPENED"]).default("WA_OPENED") });
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  await prisma.guest.updateMany({ where:{ id:{ in:p.data.guestIds }, weddingId:session.user.weddingId }, data:{ shareStatus:p.data.shareStatus, lastSharedAt:new Date() } });
  return ok({ updated: p.data.guestIds.length });
}
