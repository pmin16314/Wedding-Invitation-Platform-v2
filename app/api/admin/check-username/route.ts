import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const username  = req.nextUrl.searchParams.get("username")?.toLowerCase().trim() ?? "";
  const excludeId = req.nextUrl.searchParams.get("excludeId") ?? "";
  if (!username || username.length < 3) return ok({ available: false, reason: "Too short" });
  if (!/^[a-z0-9._-]+$/.test(username)) return ok({ available: false, reason: "Invalid characters" });
  const existing  = await prisma.user.findUnique({ where: { username } });
  return ok({ available: !existing || existing.id === excludeId });
}
