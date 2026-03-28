import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const S = z.object({
  title:      z.string().max(100).optional(),
  time:       z.string().optional(),
  location:   z.string().max(300).optional(),
  nekathTime: z.string().max(20).optional().nullable(),
  notes:      z.string().max(300).optional().nullable(),
  order:      z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return err("Unauthorised", 401);

  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);

  const eventId = (await params).id;

  // Scope the lookup:
  // - ADMIN: can edit any event but must verify it exists
  // - COUPLE: must own the event (scoped to their weddingId from JWT)
  const where = session.user.role === "ADMIN"
    ? { id: eventId }
    : { id: eventId, weddingId: session.user.weddingId! };

  const ev = await prisma.weddingEvent.findFirst({ where });
  if (!ev) return err("Not found", 404);

  const data: any = { ...p.data };
  if (data.time) data.time = new Date(data.time);

  const event = await prisma.weddingEvent.update({ where: { id: eventId }, data });
  return ok({ event });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return err("Unauthorised", 401);

  const eventId = (await params).id;

  // Same scoping as PATCH
  const where = session.user.role === "ADMIN"
    ? { id: eventId }
    : { id: eventId, weddingId: session.user.weddingId! };

  const ev = await prisma.weddingEvent.findFirst({ where });
  if (!ev) return err("Not found", 404);

  await prisma.weddingEvent.delete({ where: { id: eventId } });
  return ok({ deleted: true });
}
