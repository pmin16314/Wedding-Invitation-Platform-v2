import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CoupleLoginForm from "./CoupleLoginForm";
import "../../[slug]/login.css";

export default async function CoupleLoginPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (session?.user?.weddingSlug === (await params).slug) redirect("/dashboard");

  const wedding = await prisma.wedding.findUnique({
    where: { slug: (await params).slug },
    include: { content: true, theme: true },
  });
  if (!wedding) notFound();

  const name = wedding.content?.brideName && wedding.content?.groomName
    ? `${wedding.content.brideName} & ${wedding.content.groomName}` : wedding.slug;
  const date = wedding.content?.weddingDate
    ? new Date(wedding.content.weddingDate).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})
    : null;

  return (
    <div className="login-wrap">
      <div className="login-left couple-login-left" style={{background: wedding.theme?.primaryColor ?? "#C9A84C"}}>
        <div className="login-left-brand">
          <div className="login-brand-mark">✦</div>
          <span className="login-brand-name">Vowly Invites</span>
        </div>
        <div className="login-left-body">
          <p className="login-left-tag fade-up">Your Wedding Portal</p>
          <h2 className="login-left-headline fade-up d1" style={{color:"white",fontSize:56}}>
            {wedding.content?.brideName ?? "Bride"}<br />
            <em style={{color:"rgba(255,255,255,.6)",fontSize:32}}>&</em><br />
            {wedding.content?.groomName ?? "Groom"}
          </h2>
          {date && <p style={{marginTop:16,color:"rgba(255,255,255,.8)",fontFamily:"var(--font-display)",fontSize:17}} className="fade-up d2">{date}</p>}
          {wedding.content?.venue && <p style={{marginTop:6,color:"rgba(255,255,255,.6)",fontSize:14}} className="fade-up d3">{wedding.content.venue}<br/>{wedding.content.venueAddress}</p>}
          <a href={`/${(await params).slug}`} style={{display:"inline-block",marginTop:24,fontSize:12,color:"rgba(255,255,255,.6)",textDecoration:"none"}} className="fade-up d4">← View invitation</a>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          <p className="login-eyebrow fade-up">Welcome Back</p>
          <h1 className="login-title fade-up d1">Access your<br/>dashboard</h1>
          <p className="login-subtitle fade-up d2">Sign in with your username to manage guests, track RSVPs, and update your wedding details.</p>
          <CoupleLoginForm slug={(await params).slug} primaryColor={wedding.theme?.primaryColor ?? "#C9A84C"} />
          <p className="login-footer fade-up d4">
            Not your wedding? <a href={`/${(await params).slug}`}>View the invitation →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
