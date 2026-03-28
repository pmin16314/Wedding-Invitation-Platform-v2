import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  await prisma.wedding.delete({ where: { id: (await params).id } });
  return ok({ deleted: true });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const w = await prisma.wedding.findUnique({
    where: { id: (await params).id },
    include: { content: true, theme: true, couple: { select: { email: true, name: true } }, _count: { select: { guests: true, rsvps: true } } },
  });
  if (!w) return err("Not found", 404);
  return ok({ wedding: w });
}
