import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";

const S = z.object({
  name: z.string().min(1, "Name is required").max(80).trim(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorised", 401);

  const body = await req.json().catch(() => null);
  const p = S.safeParse(body);
  if (!p.success) return err(p.error.errors[0].message, 422);

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { name: p.data.name },
  });

  return ok({ name: p.data.name });
}
