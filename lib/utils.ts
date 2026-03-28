import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(16).toString("hex"); // 128-bit entropy
}

export function makeSlug(bride: string, groom: string, year: number): string {
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  return `${clean(bride)}-and-${clean(groom)}-${year}`;
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}

export function ok(data: object, status = 200) {
  return Response.json({ ok: true, data }, { status });
}

export function err(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

export function signCloudinary(folder: string, publicId?: string) {
  const NAME   = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  const KEY    = process.env.CLOUDINARY_API_KEY    ?? "";
  const SECRET = process.env.CLOUDINARY_API_SECRET ?? "";
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = { timestamp, folder };
  if (publicId) params.public_id = publicId;
  const str = Object.entries(params).sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}=${v}`).join("&") + SECRET;
  const signature = crypto.createHash("sha256").update(str).digest("hex");
  return { uploadUrl: `https://api.cloudinary.com/v1_1/${NAME}/image/upload`, signature, timestamp, apiKey: KEY, folder, publicId: publicId ?? null };
}

// Rate limiter
const rl = new Map<string, number[]>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (rl.get(key) ?? []).filter((t: number) => now - t < windowMs);
  if (hits.length >= limit) { rl.set(key, hits); return false; }
  hits.push(now); rl.set(key, hits); return true;
}

// Chat SSE — globalThis singleton so it survives Next.js hot reload in dev
const g = globalThis as any;
if (!g.__chatSubs) g.__chatSubs = new Map<string, Set<ReadableStreamDefaultController>>();
const subs: Map<string, Set<ReadableStreamDefaultController>> = g.__chatSubs;

export function chatSubscribe(id: string, ctrl: ReadableStreamDefaultController) {
  if (!subs.has(id)) subs.set(id, new Set());
  subs.get(id)!.add(ctrl);
}
export function chatUnsubscribe(id: string, ctrl: ReadableStreamDefaultController) {
  subs.get(id)?.delete(ctrl);
  if (subs.get(id)?.size === 0) subs.delete(id);
}
export function chatBroadcast(id: string, data: object) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  Array.from(subs.get(id) ?? []).forEach(c => { try { c.enqueue(msg); } catch { chatUnsubscribe(id, c); } });
}
