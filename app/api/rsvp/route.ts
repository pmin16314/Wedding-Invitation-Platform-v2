import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, rateLimit } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ token:z.string().min(1), attending:z.boolean(), attendeeCount:z.number().int().min(0).max(6).default(1), mealPreference:z.string().max(50).optional(), dietaryNotes:z.string().max(300).optional(), message:z.string().max(600).optional() });
export async function POST(req: NextRequest) {
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err("Invalid RSVP data", 400);
  const { token, attending, attendeeCount, mealPreference, dietaryNotes, message } = p.data;
  if (!rateLimit(`rsvp:${token}`, 5, 3600000)) return err("Too many requests", 429);
  const guest = await prisma.guest.findUnique({ where:{ token }, include:{ wedding:{ select:{ status:true, rsvpDeadline:true, id:true } } } });
  if (!guest || guest.wedding.status !== "PUBLISHED") return err("Invalid invitation link", 404);
  if (guest.wedding.rsvpDeadline && new Date() > new Date(guest.wedding.rsvpDeadline)) return err("RSVP_CLOSED", 403);
  const count = Math.min(attendeeCount, guest.maxAttendees);
  const rsvp = await prisma.rSVP.upsert({
    where:{ guestId:guest.id },
    create:{ weddingId:guest.weddingId, guestId:guest.id, attending, attendeeCount:attending?count:0, mealPreference, dietaryNotes, message },
    update:{ attending, attendeeCount:attending?count:0, mealPreference, dietaryNotes, message, updatedAt:new Date() },
  });
  return ok({ rsvp });
}
