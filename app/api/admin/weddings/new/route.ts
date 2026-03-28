import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err, makeSlug } from "@/lib/utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const S = z.object({
  brideName:       z.string().min(1).max(100).trim(),
  groomName:       z.string().min(1).max(100).trim(),
  coupleUsername:  z.string().min(3).max(50).toLowerCase().trim()
                     .regex(/^[a-z0-9._-]+$/, "Username can only contain letters, numbers, dots, hyphens and underscores"),
  coupleEmail:     z.string().email().max(200).toLowerCase().trim().optional(),
  couplePassword:  z.string().min(8).max(72).optional(),
  package:         z.enum(["BASIC","CLASSIC","PREMIUM"]).default("CLASSIC"),
  weddingDate:     z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);
  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);

  const { brideName, groomName, coupleUsername, coupleEmail, couplePassword, package: pkg, weddingDate } = p.data;

  // Check uniqueness
  if (await prisma.user.findUnique({ where: { username: coupleUsername } }))
    return err("Username already taken", 409);
  if (coupleEmail && await prisma.user.findFirst({ where: { email: coupleEmail } }))
    return err("Email already in use", 409);

  const pw   = couplePassword ?? crypto.randomBytes(6).toString("hex");
  const hash = await bcrypt.hash(pw, 12);
  const year = weddingDate ? new Date(weddingDate).getFullYear() : new Date().getFullYear();
  let slug   = makeSlug(brideName, groomName, year);
  if (await prisma.wedding.findUnique({ where: { slug } })) slug = slug + "-" + Math.floor(Math.random() * 100);

  const user = await prisma.user.create({
    data: {
      username: coupleUsername,
      email:    coupleEmail ?? null,
      name:     `${brideName} & ${groomName}`,
      passwordHash: hash,
      role: "COUPLE",
    },
  });

  const wedding = await prisma.wedding.create({
    data: {
      slug, coupleId: user.id, package: pkg,
      content: { create: { brideName, groomName, weddingDate: weddingDate ? new Date(weddingDate) : undefined } },
      theme:   { create: {} },
      chatMessages: { create: { senderRole:"SYSTEM", senderName:"Vowly", content:`Welcome, ${brideName} & ${groomName}! 🎉 Your Vowly Invites account is ready. Fill in your wedding details in the dashboard and reach out here anytime you need help.` } },
    },
  });

  revalidatePath("/admin/weddings");
  return ok({ wedding, username: coupleUsername, password: pw }, 201);
}
