import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ weddingId:z.string().uuid(), guestId:z.string().uuid().optional(), guestName:z.string().min(1).max(100).trim(), message:z.string().min(1).max(600).trim() });
export async function POST(req: NextRequest) {
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  const wedding = await prisma.wedding.findUnique({ where:{id:p.data.weddingId}, select:{status:true} });
  if (!wedding || wedding.status !== "PUBLISHED") return err("Not found", 404);
  const wish = await prisma.guestWish.create({ data:p.data });
  return ok({ wish }, 201);
}
