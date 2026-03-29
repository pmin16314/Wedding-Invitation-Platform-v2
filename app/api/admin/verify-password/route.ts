import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

const S = z.object({
  password: z.string().min(1),
});

// POST — verify the current admin's password. Returns ok if correct.
// Used by the couple credential reveal flow.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return err("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  const p = S.safeParse(body);
  if (!p.success) return err("Password required", 422);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return err("User not found", 404);

  const valid = await bcrypt.compare(p.data.password, user.passwordHash);
  if (!valid) return err("Incorrect password", 403);

  return ok({ verified: true });
}
