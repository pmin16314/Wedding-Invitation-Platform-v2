import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ rsvpDeadline:z.string().optional().nullable(), momentsUnlockTime:z.string().optional().nullable() });
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  const parse = (v?: string|null) => { if(!v) return null; const d=new Date(v); return isNaN(d.getTime())?null:d; };
  await prisma.wedding.update({ where:{ id:session.user.weddingId }, data:{ rsvpDeadline:parse(p.data.rsvpDeadline), momentsUnlockTime:parse(p.data.momentsUnlockTime) } });
  return ok({ saved: true });
}
