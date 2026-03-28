import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LeadsClient from "./LeadsClient";

export const metadata = { title: "Leads — Vowly Admin" };

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="a-page-scroll"><div className="fade-in">
      <div className="a-page-top">
        <div>
          <p className="a-page-label">Platform</p>
          <h1 className="a-page-title">Leads</h1>
        </div>
      </div>
      <LeadsClient leads={leads.map(l => ({
        ...l, createdAt: l.createdAt.toISOString(), updatedAt: l.updatedAt.toISOString(),
      }))} />
    </div></div>
  );
}
