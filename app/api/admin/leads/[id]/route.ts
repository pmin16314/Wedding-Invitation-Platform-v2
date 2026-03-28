import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { z } from "zod";
const S = z.object({ status:z.enum(["NEW","CONTACTED","PAID","CONVERTED","LOST"]).optional(), notes:z.string().max(2000).optional().nullable() });
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);
  const lead = await prisma.lead.update({ where:{ id:(await params).id }, data:p.data });
  return ok({ lead });
}
