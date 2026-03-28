import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const S = z.object({
  brideName:          z.string().max(100).optional(),
  groomName:          z.string().max(100).optional(),
  brideParents:       z.string().max(200).optional(),
  groomParents:       z.string().max(200).optional(),
  bridePhone:         z.string().max(20).optional(),
  groomPhone:         z.string().max(20).optional(),
  weddingDate:        z.string().optional().nullable(),
  venue:              z.string().max(200).optional(),
  subVenue:           z.string().max(200).optional(),
  venueAddress:       z.string().max(300).optional(),
  googleMapsUrl:      z.string().max(500).optional(),
  preInvitationText:  z.string().max(500).optional(),
  invitationLine:     z.string().max(500).optional(),
  loveStory:          z.string().max(5000).optional(),
  dressCode:          z.string().max(100).optional(),
  religiousCeremony:  z.string().max(300).optional(),
  postCeremonyNote:   z.string().max(500).optional(),
  specialNote:        z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return err("Unauthorised", 401);

  const p = S.safeParse(await req.json().catch(() => null));
  if (!p.success) return err(p.error.errors[0].message, 422);

  const data: any = { ...p.data };
  if (data.weddingDate) {
    const d = new Date(data.weddingDate);
    data.weddingDate = isNaN(d.getTime()) ? undefined : d;
  } else {
    data.weddingDate = undefined;
  }

  const id = (await params).id;
  const content = await prisma.weddingContent.upsert({
    where:  { weddingId: id },
    create: { weddingId: id, ...data },
    update: data,
  });
  const w = await prisma.wedding.findUnique({ where: { id }, select: { slug: true } });
  if (w) revalidatePath(`/${w.slug}`);
  return ok({ content });
}
