import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, chatBroadcast } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ weddingId:z.string().uuid(), content:z.string().min(1).max(4000) });
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return err("Unauthorised", 401);
  const weddingId = req.nextUrl.searchParams.get("weddingId");
  if (!weddingId) return err("Missing weddingId", 400);
  if (session.user.role!=="ADMIN" && session.user.weddingId!==weddingId) return err("Forbidden", 403);
  const messages = await prisma.chatMessage.findMany({ where:{ weddingId }, orderBy:{ createdAt:"asc" } });
  await prisma.chatMessage.updateMany({ where:{ weddingId, senderRole:session.user.role==="ADMIN"?"COUPLE":"ADMIN", isRead:false }, data:{ isRead:true, readAt:new Date() } });
  return ok({ messages });
}
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  if (session.user.role!=="ADMIN" && session.user.weddingId!==p.data.weddingId) return err("Forbidden", 403);
  const message = await prisma.chatMessage.create({ data:{ weddingId:p.data.weddingId, senderRole:session.user.role==="ADMIN"?"ADMIN":"COUPLE", senderName:session.user.name??(session.user.role==="ADMIN"?"Vowly Support":"Couple"), content:p.data.content } });
  chatBroadcast(p.data.weddingId, { type:"message", message });
  return ok({ message }, 201);
}
