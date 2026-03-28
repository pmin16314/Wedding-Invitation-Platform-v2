import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const GuestSchema = z.object({
  name:        z.string().max(100).trim().optional(),
  inviteType:  z.enum(["INDIVIDUAL","COUPLE","FAMILY"]).optional(),
  salutation:  z.string().max(20).optional(),
  email:       z.string().email().max(200).optional().or(z.literal("")),
  phone:       z.string().max(20).optional(),
  maxAttendees:z.number().int().min(1).max(6).optional(),
  group:       z.string().max(100).optional(),
  side:        z.enum(["BRIDE","GROOM","BOTH"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const p = GuestSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  const existing = await prisma.guest.findFirst({ where:{id:(await params).id,weddingId:session.user.weddingId} });
  if (!existing) return err("Not found", 404);
  const guest = await prisma.guest.update({ where:{id:(await params).id}, data:p.data, include:{rsvp:true} });
  return ok({ guest });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const g = await prisma.guest.findFirst({ where:{id:(await params).id,weddingId:session.user.weddingId} });
  if (!g) return err("Not found", 404);
  await prisma.guest.delete({ where:{id:(await params).id} });
  return ok({ deleted:true });
}
