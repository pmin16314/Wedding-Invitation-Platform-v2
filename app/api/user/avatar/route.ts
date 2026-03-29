import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/utils";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorised", 401);

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;
  if (!file) return err("No file provided", 400);

  if (!file.type.startsWith("image/")) return err("File must be an image", 422);
  if (file.size > 5 * 1024 * 1024)     return err("File must be under 5MB", 422);

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "vowly/avatars", public_id: `user_${session.user.id}`,
        overwrite: true, transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }] },
      (error, result) => error ? reject(error) : resolve(result)
    ).end(buffer);
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { avatarUrl: result.secure_url },
  });

  return ok({ avatarUrl: result.secure_url });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return err("Unauthorised", 401);

  await prisma.user.update({
    where: { id: session.user.id },
    data:  { avatarUrl: null },
  });

  return ok({ message: "Avatar removed" });
}
