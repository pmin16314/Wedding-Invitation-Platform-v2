import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const S = z.object({
  title:      z.string().min(1).max(100).trim(),
  time:       z.string(),
  location:   z.string().min(1).max(300).trim(),
  nekathTime: z.string().max(20).optional().nullable(),
  notes:      z.string().max(300).optional().nullable(),
  order:      z.number().int().default(0),
  // weddingId accepted in body for admin — validated separately below
  weddingId:  z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return err("Unauthorised", 401);

  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);

  let weddingId: string;

  if (session.user.role === "ADMIN") {
    // Admin must supply a valid weddingId that actually exists
    if (!p.data.weddingId) return err("weddingId is required", 400);
    const wedding = await prisma.wedding.findUnique({
      where: { id: p.data.weddingId },
      select: { id: true },
    });
    if (!wedding) return err("Wedding not found", 404);
    weddingId = wedding.id;
  } else {
    // Couple — weddingId comes from their JWT, not the request body
    if (!session.user.weddingId) return err("Unauthorised", 401);
    weddingId = session.user.weddingId;
  }

  // Strip weddingId from the event data (it's a separate column, not part of the schema fields)
  const { weddingId: _ignored, ...eventData } = p.data;
  const event = await prisma.weddingEvent.create({
    data: { ...eventData, time: new Date(eventData.time), weddingId },
  });
  return ok({ event }, 201);
}
