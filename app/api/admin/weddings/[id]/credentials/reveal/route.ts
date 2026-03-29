import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import bcrypt from "bcryptjs";

// POST — generate a new temporary password for this couple and return it.
// Admin has already verified their identity via /api/admin/verify-password.
// We cannot recover the original bcrypt hash — we generate a fresh readable password instead.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return err("Unauthorised", 401);

  const { id } = await params;
  const wedding = await prisma.wedding.findUnique({
    where: { id },
    select: { coupleId: true },
  });
  if (!wedding) return err("Wedding not found", 404);

  // Generate a memorable temporary password
  const adjectives = ["sunny","happy","sweet","bright","warm","gentle","calm","kind"];
  const nouns      = ["rose","dove","star","moon","river","bloom","pearl","cloud"];
  const num        = Math.floor(Math.random() * 900) + 100;
  const newPassword = `${adjectives[Math.floor(Math.random()*adjectives.length)]}-${nouns[Math.floor(Math.random()*nouns.length)]}-${num}`;

  await prisma.user.update({
    where: { id: wedding.coupleId },
    data:  { passwordHash: await bcrypt.hash(newPassword, 12) },
  });

  return ok({ password: newPassword, note: "This is a newly generated password. The original cannot be recovered." });
}
