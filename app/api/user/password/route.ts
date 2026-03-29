import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { z } from "zod";

const S = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword:     z.string().min(8, "New password must be at least 8 characters").max(72),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match", path: ["confirmPassword"],
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  const p = S.safeParse(body);
  if (!p.success) return err(p.error.errors[0].message, 422);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return err("User not found", 404);

  const valid = await bcrypt.compare(p.data.currentPassword, user.passwordHash);
  if (!valid) return err("Current password is incorrect", 403);

  if (p.data.currentPassword === p.data.newPassword)
    return err("New password must be different from current password", 422);

  await prisma.user.update({
    where: { id: user.id },
    data:  { passwordHash: await bcrypt.hash(p.data.newPassword, 12) },
  });

  return ok({ message: "Password updated successfully" });
}
