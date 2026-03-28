import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, generateToken } from "@/lib/utils";
import { z } from "zod";

const TYPE_DEFAULTS: Record<string, number> = {
  MR: 1, MS: 1, MRS: 1, MR_AND_MRS: 2, FAMILY: 2,
};

const S = z.object({
  name:         z.string().min(1).max(100).trim(),
  inviteType:   z.enum(["MR","MS","MRS","MR_AND_MRS","FAMILY"]).default("MR"),
  email:        z.string().email().optional().or(z.literal("")),
  phone:        z.string().max(20).optional(),
  maxAttendees: z.number().int().min(1).max(6).optional(),
  group:        z.string().max(100).optional(),
  side:         z.enum(["BRIDE","GROOM","BOTH"]).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const guests = await prisma.guest.findMany({
    where:   { weddingId: session.user.weddingId },
    include: { rsvp: true },
    orderBy: { createdAt: "desc" },
  });
  return ok({ guests });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);

  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);

  let maxAttendees: number;
  if (p.data.inviteType === "FAMILY") {
    maxAttendees = Math.min(Math.max(p.data.maxAttendees ?? 2, 2), 6);
  } else {
    maxAttendees = TYPE_DEFAULTS[p.data.inviteType];
  }

  const { maxAttendees: _ignored, ...rest } = p.data;
  const guest = await prisma.guest.create({
    data: { ...rest, token: generateToken(), maxAttendees, weddingId: session.user.weddingId! },
    include: { rsvp: true },
  });
  return ok({ guest }, 201);
}
