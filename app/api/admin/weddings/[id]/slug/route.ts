import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";
import { revalidatePath } from "next/cache";
const S = z.object({ slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/) });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err("Invalid slug format", 422);
  const id = (await params).id;
  const existing = await prisma.wedding.findUnique({ where: { slug: p.data.slug } });
  if (existing && existing.id !== id) return err("Slug already taken", 409);
  const w = await prisma.wedding.update({ where: { id }, data: { slug: p.data.slug } });
  revalidatePath(`/${w.slug}`);
  return ok({ slug: w.slug });
}
