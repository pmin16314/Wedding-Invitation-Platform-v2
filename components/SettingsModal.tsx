"use client";
import { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  open:            boolean;
  onClose:         () => void;
  user:            { name: string; email: string; avatarUrl?: string | null };
  onAvatarChange?: (url: string | null) => void;
  onNameChange?:   (name: string) => void;
  theme?:          "admin" | "dashboard";
}

type Tab = "account" | "password";

export default function SettingsModal({ open, onClose, user, onAvatarChange, onNameChange, theme = "admin" }: Props) {
  const [tab,       setTab]      = useState<Tab>("account");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? null);
  const [name,      setName]      = useState(user.name);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password fields
  const [pw,     setPw]     = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  const pfx = theme === "admin" ? "a" : "db";

  // Reset on open
  useEffect(() => {
    if (open) {
      setTab("account");
      setMsg(null);
      setPw({ current: "", next: "", confirm: "" });
      setAvatarUrl(user.avatarUrl ?? null);
      setName(user.name);
    }
  }, [open, user.avatarUrl, user.name]);

  // Escape to close
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);
  useEffect(() => {
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() === user.name) return;
    setSaving(true); setMsg(null);
    const res = await fetch("/api/user/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const j = await res.json();
    setSaving(false);
    if (res.ok) {
      onNameChange?.(name.trim());
      setMsg({ text: "Name updated", ok: true });
    } else {
      setMsg({ text: j.error ?? "Failed to update name", ok: false });
    }
  }

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) { setMsg({ text: "File must be an image", ok: false }); return; }
    if (file.size > 5 * 1024 * 1024)     { setMsg({ text: "File must be under 5MB",  ok: false }); return; }
    setUploading(true); setMsg(null);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/user/avatar", { method: "POST", body: fd });
    const j   = await res.json();
    setUploading(false);
    if (res.ok) {
      setAvatarUrl(j.data.avatarUrl);
      onAvatarChange?.(j.data.avatarUrl);
      setMsg({ text: "Photo updated", ok: true });
    } else {
      setMsg({ text: j.error ?? "Upload failed", ok: false });
    }
  }

  async function removeAvatar() {
    setUploading(true); setMsg(null);
    await fetch("/api/user/avatar", { method: "DELETE" });
    setUploading(false);
    setAvatarUrl(null);
    onAvatarChange?.(null);
    setMsg({ text: "Photo removed", ok: true });
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) { setMsg({ text: "New passwords do not match", ok: false }); return; }
    if (pw.next.length < 8)     { setMsg({ text: "Must be at least 8 characters", ok: false }); return; }
    if (pw.current === pw.next) { setMsg({ text: "New password must differ from current", ok: false }); return; }
    setSaving(true); setMsg(null);
    const res = await fetch("/api/user/password", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next, confirmPassword: pw.confirm }),
    });
    const j = await res.json();
    setSaving(false);
    if (res.ok) {
      setPw({ current: "", next: "", confirm: "" });
      setMsg({ text: "Password changed successfully ✓", ok: true });
    } else {
      setMsg({ text: j.error ?? "Failed to change password", ok: false });
    }
  }

  if (!open) return null;

  const initials = name.split(/\s+/).filter(Boolean).map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

  return (
    <div className="settings-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="settings-modal">

        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Account Settings</h2>
          <button className="settings-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          {(["account", "password"] as Tab[]).map(t => (
            <button key={t} className={`settings-tab${tab === t ? " active" : ""}`}
              onClick={() => { setTab(t); setMsg(null); }}>
              {t === "account" ? "Account" : "Password"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="settings-body">

          {msg && (
            <div className={`settings-msg ${msg.ok ? "ok" : "err"}`}>
              {msg.ok ? "✓" : "✕"} {msg.text}
            </div>
          )}

          {/* ── Account tab ── */}
          {tab === "account" && (
            <div>
              {/* Avatar */}
              <div className="settings-avatar-section">
                <div className="settings-avatar-wrap">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={name} className="settings-avatar-img" />
                    : <div className="settings-avatar-placeholder">{initials}</div>
                  }
                  {uploading && (
                    <div className="settings-avatar-loading">
                      <span className={`${pfx}-spinner`} />
                    </div>
                  )}
                </div>
                <div className="settings-avatar-actions">
                  <p className="settings-avatar-name">{name}</p>
                  <p className="settings-avatar-email">{user.email || "No email set"}</p>
                  <div className="settings-avatar-btns">
                    <label className="settings-btn-outline" style={{ cursor: "pointer" }}>
                      {avatarUrl ? "Change photo" : "Upload photo"}
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }}
                      />
                    </label>
                    {avatarUrl && (
                      <button className="settings-btn-ghost" onClick={removeAvatar} disabled={uploading}>
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="settings-avatar-hint">JPG, PNG or WebP · Max 5 MB · Cropped to square</p>
                </div>
              </div>

              {/* Display name edit */}
              <form onSubmit={saveName} className="settings-name-form">
                <div className="settings-field">
                  <label className="settings-label">Display Name</label>
                  <div className="settings-pw-row">
                    <input
                      className="settings-input"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={80}
                    />
                    <button
                      type="submit"
                      className="settings-btn-outline"
                      disabled={saving || name.trim() === user.name || !name.trim()}
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              </form>

              {/* Read-only info */}
              <div className="settings-info-grid">
                {[
                  ["Email",    user.email || "—"],
                ].map(([l, v]) => (
                  <div key={l} className="settings-info-row">
                    <span className="settings-info-lbl">{l}</span>
                    <span className="settings-info-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Password tab ── */}
          {tab === "password" && (
            <form onSubmit={changePassword} className="settings-pw-form">
              <p className="settings-pw-desc">
                Enter your current password, then choose a new one.
              </p>
              {([
                { key: "current" as const, label: "Current Password",     placeholder: "Your current password",  auto: "current-password" },
                { key: "next"    as const, label: "New Password",         placeholder: "At least 8 characters",  auto: "new-password" },
                { key: "confirm" as const, label: "Confirm New Password", placeholder: "Repeat new password",     auto: "new-password" },
              ]).map(({ key, label, placeholder, auto }) => (
                <div className="settings-field" key={key}>
                  <label className="settings-label">{label}</label>
                  <div className="settings-pw-row">
                    <input
                      type={showPw[key] ? "text" : "password"}
                      className="settings-input"
                      placeholder={placeholder}
                      value={pw[key]}
                      onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                      required
                      autoComplete={auto}
                    />
                    <button type="button" className="settings-pw-toggle"
                      onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}>
                      {showPw[key] ? "Hide" : "Show"}
                    </button>
                  </div>
                  {key === "next" && pw.next.length > 0 && (
                    <div className="settings-pw-strength">
                      <div className="settings-pw-bar">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`settings-pw-segment${getStrength(pw.next) >= i ? " filled-" + getStrengthClass(pw.next) : ""}`} />
                        ))}
                      </div>
                      <span className="settings-pw-strength-lbl">{getStrengthLabel(pw.next)}</span>
                    </div>
                  )}
                  {key === "confirm" && pw.confirm.length > 0 && pw.next !== pw.confirm && (
                    <p className="settings-pw-mismatch">Passwords do not match</p>
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="settings-btn-primary"
                disabled={saving || !pw.current || !pw.next || !pw.confirm || pw.next !== pw.confirm}
              >
                {saving ? <><span className={`${pfx}-spinner`} /> Changing…</> : "Change Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Password strength ── */
function getStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) s++;
  return s;
}
function getStrengthClass(pw: string) {
  const s = getStrength(pw);
  return s <= 1 ? "weak" : s === 2 ? "fair" : s === 3 ? "good" : "strong";
}
function getStrengthLabel(pw: string) {
  const s = getStrength(pw);
  return s <= 1 ? "Weak" : s === 2 ? "Fair" : s === 3 ? "Good" : "Strong";
}
