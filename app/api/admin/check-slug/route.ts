import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const slug      = req.nextUrl.searchParams.get("slug")?.toLowerCase().trim() ?? "";
  const excludeId = req.nextUrl.searchParams.get("excludeId") ?? "";
  if (!slug || slug.length < 3)   return ok({ available: false, reason: "Too short" });
  if (!/^[a-z0-9-]+$/.test(slug)) return ok({ available: false, reason: "Invalid characters" });
  const existing  = await prisma.wedding.findUnique({ where: { slug } });
  return ok({ available: !existing || existing.id === excludeId });
}
