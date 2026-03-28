"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function CoupleLoginForm({ slug, primaryColor }: { slug: string; primaryColor: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { username, password, slug, redirect: false });
    if (res?.error) { setLoading(false); setError("Invalid username or password."); return; }
    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={submit} className="fade-up d3">
      {error && <div className="login-error">{error}</div>}
      <div className="login-field">
        <label className="login-label">Username</label>
        <input
          className="login-input"
          type="text"
          required
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="your username"
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
            placeholder="your password"
          />
          <button type="button" className="login-pw-toggle" onClick={() => setShowPw(s => !s)}>
            {showPw ? "🙈" : "👁"}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="login-submit couple-login-cta"
        style={{ background: primaryColor }}
        disabled={loading}
      >
        {loading ? <><span className="a-spinner" />Signing in…</> : "ACCESS MY WEDDING"}
      </button>
    </form>
  );
}
