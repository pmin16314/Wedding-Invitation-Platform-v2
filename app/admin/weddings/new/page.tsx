import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NewWeddingForm from "./NewWeddingForm";

export const metadata = { title: "New Wedding — Vowly Admin" };

export default async function NewWeddingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  return (
    <div className="a-page-scroll"><div className="fade-in">
      <div className="a-page-header">
        <p className="a-page-label"><a href="/admin/weddings" className="a-no-underline a-text-charcoal-mute">Weddings</a> › New</p>
        <h1 className="a-page-title">Create Wedding</h1>
        <p className="a-page-subtitle">Set up a new couple account and wedding record.</p>
      </div>
      <NewWeddingForm />
    </div></div>
  );
}
