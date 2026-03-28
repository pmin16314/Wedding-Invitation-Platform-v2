import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import "./login.css";

export const metadata = { title: "Admin Login — Vowly Invites", robots: "noindex" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect(session.user.role === "ADMIN" ? "/admin" : "/dashboard");
  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="login-left-brand">
          <div className="login-brand-mark">✦</div>
          <span className="login-brand-name">Vowly Invites</span>
        </div>
        <div className="login-left-body">
          <p className="login-left-tag fade-up">Administration</p>
          <h2 className="login-left-headline fade-up d1">Platform<br /><em>control</em><br />panel.</h2>
          <p className="login-left-sub fade-up d2">Restricted access. Authorised personnel only.</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          <p className="login-eyebrow fade-up">Admin Portal</p>
          <h1 className="login-title fade-up d1">Sign in</h1>
          <p className="login-subtitle fade-up d2">Enter your administrator username and password to continue.</p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="login-footer fade-up d4">
            Are you a couple? <a href="/">Visit the homepage</a> to find your invitation link.
          </p>
        </div>
      </div>
    </div>
  );
}
