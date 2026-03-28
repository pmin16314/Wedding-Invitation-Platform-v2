import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ username: z.string().min(3).max(50).regex(/^[a-z0-9._-]+$/).toLowerCase() });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err("Invalid username", 422);
  const id = (await params).id;
  const w  = await prisma.wedding.findUnique({ where: { id }, select: { coupleId: true } });
  if (!w) return err("Not found", 404);
  const existing = await prisma.user.findUnique({ where: { username: p.data.username } });
  if (existing && existing.id !== w.coupleId) return err("Username already taken", 409);
  await prisma.user.update({ where: { id: w.coupleId }, data: { username: p.data.username } });
  return ok({ username: p.data.username });
}
