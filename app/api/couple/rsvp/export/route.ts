import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err } from "@/lib/utils";
export async function GET() {
  const session = await auth();
  if (!session?.user?.weddingId) return err("Unauthorised", 401);
  const w = await prisma.wedding.findUnique({ where:{ id:session.user.weddingId }, select:{ package:true } });
  if (!w || w.package==="BASIC") return err("Requires Classic or Premium", 403);
  const rsvps = await prisma.rSVP.findMany({ where:{ weddingId:session.user.weddingId }, include:{ guest:{ select:{ name:true, phone:true, group:true } } }, orderBy:{ submittedAt:"desc" } });
  const rows = [["Name","Display Name","Phone","Group","Attending","Seats","Meal","Dietary","Message","Submitted"]];
  rsvps.forEach(r=>rows.push([r.guest.name,r.guest.name,r.guest.phone??"",r.guest.group??"",r.attending?"Yes":"No",String(r.attendeeCount),r.mealPreference??"",r.dietaryNotes??"",r.message??"",new Date(r.submittedAt).toLocaleString("en-GB")]));
  const csv=rows.map(r=>r.map(c=>`"${c.replace(/"/g,'""')}"`).join(",")).join("\n");
  return new Response(csv,{ headers:{ "Content-Type":"text/csv", "Content-Disposition":"attachment; filename=rsvp-export.csv" } });
}
