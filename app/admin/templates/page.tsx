import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Templates — Vowly Admin" };

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  return (
    <div className="a-page-scroll"><div className="fade-in">
      <div className="a-page-header">
        <p className="a-page-label">Design</p>
        <h1 className="a-page-title">Templates & Themes</h1>
        <p className="a-page-subtitle">Manage invitation templates and preset colour themes.</p>
      </div>
      <div className="a-card">
        <div className="a-card-body">
          <div className="a-empty">
            <div className="a-empty-icon">🎨</div>
            <div className="a-empty-title">Template management coming soon</div>
            <div className="a-empty-text">Theme presets and template management will be available here in a future update. Templates are currently configured per-wedding in the Design tab.</div>
          </div>
        </div>
      </div>
    </div></div>
  );
}
