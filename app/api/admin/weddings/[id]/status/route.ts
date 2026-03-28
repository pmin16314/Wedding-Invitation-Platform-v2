import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
const S = z.object({ status: z.enum(["DRAFT","PUBLISHED","ARCHIVED"]) });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err("Invalid status", 422);
  const w = await prisma.wedding.update({ where: { id: (await params).id }, data: { status: p.data.status } });
  revalidatePath(`/${w.slug}`);
  return ok({ wedding: w });
}
