import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, rateLimit } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ name:z.string().min(2).max(200).trim(), email:z.string().email().max(200).toLowerCase().trim(), whatsapp:z.string().min(7).max(20), package:z.enum(["BASIC","CLASSIC","PREMIUM"]).default("CLASSIC"), hasDesignerCard:z.boolean().default(false) });
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`lead:${ip}`, 3, 3600000)) return err("Too many requests", 429);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  const lead = await prisma.lead.create({ data: p.data });
  return ok({ lead }, 201);
}
