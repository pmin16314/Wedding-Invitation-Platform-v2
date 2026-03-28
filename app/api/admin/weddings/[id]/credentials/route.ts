import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

const S = z.object({
  newPassword: z.string().min(8).max(72).optional(),
  newUsername: z.string().min(3).max(50).toLowerCase().trim()
    .regex(/^[a-z0-9._-]+$/, "Username may only contain letters, numbers, dots, hyphens and underscores")
    .optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  if (!p.data.newPassword && !p.data.newUsername) return err("Provide newPassword or newUsername", 400);

  const w = await prisma.wedding.findUnique({ where:{ id:(await params).id }, select:{ coupleId:true } });
  if (!w) return err("Not found", 404);

  const data: any = {};
  if (p.data.newPassword) data.passwordHash = await bcrypt.hash(p.data.newPassword, 12);
  if (p.data.newUsername) {
    const existing = await prisma.user.findUnique({ where:{ username: p.data.newUsername } });
    if (existing && existing.id !== w.coupleId) return err("Username already taken", 409);
    data.username = p.data.newUsername;
  }

  await prisma.user.update({ where:{ id:w.coupleId }, data });
  return ok({ updated: true });
}
