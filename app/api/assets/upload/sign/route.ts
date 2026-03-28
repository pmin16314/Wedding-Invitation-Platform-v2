import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { signCloudinary } from "@/lib/utils";
import { ok, err } from "@/lib/utils";
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const { weddingId, slot } = await req.json().catch(() => ({}));
  if (!weddingId || !slot) return err("Missing params", 400);
  return ok(signCloudinary(`vowly/${weddingId}`, `${weddingId}-${slot.toLowerCase()}`));
}
