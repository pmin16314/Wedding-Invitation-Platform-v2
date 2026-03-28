import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { chatSubscribe, chatUnsubscribe } from "@/lib/utils";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorised", { status: 401 });
  const weddingId = req.nextUrl.searchParams.get("weddingId");
  if (!weddingId) return new Response("Missing weddingId", { status: 400 });
  if (session.user.role!=="ADMIN" && session.user.weddingId!==weddingId) return new Response("Forbidden", { status: 403 });
  let ctrl: ReadableStreamDefaultController;
  const stream = new ReadableStream({
    start(c) {
      ctrl = c;
      ctrl.enqueue(`data: ${JSON.stringify({ type:"connected" })}\n\n`);
      chatSubscribe(weddingId, ctrl);
      req.signal.addEventListener("abort", () => { chatUnsubscribe(weddingId, ctrl); try { ctrl.close(); } catch {} });
    },
  });
  return new Response(stream, { headers:{ "Content-Type":"text/event-stream", "Cache-Control":"no-cache", "Connection":"keep-alive" } });
}
