"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { EyeClosed, EyeOpen } from "@/components/icons";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const params = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { username, password, redirect: false });
    if (res?.error) { setLoading(false); setError("Invalid username or password."); return; }
    window.location.href = "/admin";
  }

  return (
    <form onSubmit={submit} className="fade-up d3">
      {(error || params.get("error")) && (
        <div className="login-error">{error || "Authentication failed."}</div>
      )}
      <div className="login-field">
        <label className="login-label">Username</label>
        <input
          className="login-input"
          type="text"
          required
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="admin"
        />
      </div>
      <div className="login-field">
        <label className="login-label">Password</label>
        <div className="login-pw-wrap">
          <input
            className="login-input"
            type={showPw ? "text" : "password"}
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="enter the password"
          />
          <button type="button" className="login-pw-toggle" onClick={() => setShowPw(s => !s)}>
            {showPw ? <EyeClosed /> : <EyeOpen />}
          </button>
        </div>
      </div>
      <button type="submit" className="login-submit" disabled={loading}>
        {loading ? <><span className="a-spinner" />Signing in…</> : "SIGN IN"}
      </button>
    </form>
  );
}
