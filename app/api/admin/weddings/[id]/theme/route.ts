import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
const S = z.object({ primaryColor:z.string(), accentColor:z.string(), bgTint:z.string(), scriptFont:z.string().max(80), capsFont:z.string().max(80), bodyFont:z.string().max(80) });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  const theme = await prisma.weddingTheme.upsert({ where:{ weddingId:(await params).id }, create:{ weddingId:(await params).id,...p.data,isCustom:true }, update:{ ...p.data,isCustom:true } });
  const w = await prisma.wedding.findUnique({ where:{ id:(await params).id }, select:{ slug:true } });
  if (w) revalidatePath(`/${w.slug}`);
  return ok({ theme });
}
