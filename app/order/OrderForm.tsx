"use client";
import { useState } from "react";

const PACKAGES = [
  { id:"BASIC",   price:"LKR 3,900",  dur:"3 months",  features:["Common URL","10 gallery photos","All ceremony events","In-app chat support"] },
  { id:"CLASSIC", price:"LKR 9,900",  dur:"6 months",  features:["Per-guest token links","250 guests","30 photos","WhatsApp share","Designer assets","Custom theme","Analytics","CSV export"], highlight:true },
  { id:"PREMIUM", price:"LKR 21,900", dur:"12 months", features:["Everything in Classic","Unlimited guests & photos","7 designer asset slots","Cinematic intro","Parallax hero","Stays live indefinitely"] },
];

// Sri Lanka: +94 followed by exactly 9 digits (no leading 0)
// Valid formats: 71xxxxxxx, 77xxxxxxx, 78xxxxxxx, 76xxxxxxx, 75xxxxxxx, 70xxxxxxx, 72xxxxxxx, 74xxxxxxx
const LK_MOBILE_RE = /^[7][0-9]{8}$/; // 9 digits after +94

function formatLKPhone(raw: string): string {
  // Strip everything except digits
  const digits = raw.replace(/\D/g, "");
  // Remove leading 0 or 94 or 0094
  const stripped = digits.replace(/^(0094|94|0)/, "");
  return stripped;
}

function validatePhone(digits: string): string | null {
  if (!digits) return "WhatsApp number is required";
  if (digits.length !== 9) return "Must be 9 digits after +94 (e.g. 771234567)";
  if (!LK_MOBILE_RE.test(digits)) return "Must be a valid Sri Lankan mobile number (start with 7)";
  return null;
}

interface Errors {
  brideName?: string;
  groomName?: string;
  email?: string;
  phone?: string;
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%", padding: "11px 14px",
  border: `1px solid ${hasError ? "var(--red)" : "var(--ivory-border)"}`,
  borderRadius: "var(--radius-sm)", fontSize: 13,
  color: "var(--charcoal)", fontFamily: "var(--font-body)",
  outline: "none", transition: "border-color .15s",
  background: hasError ? "var(--red-pale)" : "var(--white)",
});

export default function OrderForm() {
  const [pkg, setPkg] = useState("CLASSIC");
  const [form, setForm] = useState({
    brideName: "", groomName: "", email: "",
    phone: "",          // digits only, without +94
    hasDesignerCard: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string,boolean>>({});
  const [step,    setStep]    = useState<"form"|"done">("form");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // ── Field-level validation ────────────────────────────────
  function validateField(name: string, value: string): string | undefined {
    switch (name) {
      case "brideName":
        if (!value.trim()) return "Bride's name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (value.trim().length > 60) return "Name must be under 60 characters";
        return undefined;
      case "groomName":
        if (!value.trim()) return "Groom's name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        if (value.trim().length > 60) return "Name must be under 60 characters";
        return undefined;
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address";
        return undefined;
      case "phone":
        return validatePhone(value) ?? undefined;
      default:
        return undefined;
    }
  }

  function validateAll(): Errors {
    return {
      brideName: validateField("brideName", form.brideName),
      groomName: validateField("groomName", form.groomName),
      email:     validateField("email",     form.email),
      phone:     validatePhone(form.phone)  ?? undefined,
    };
  }

  function handleChange(name: string, raw: string) {
    let value = raw;
    if (name === "phone") {
      value = formatLKPhone(raw);
      // Cap at 9 digits
      if (value.length > 9) value = value.slice(0, 9);
    }
    setForm(f => ({ ...f, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors(e => ({ ...e, [name]: err }));
    }
  }

  function handleBlur(name: string) {
    setTouched(t => ({ ...t, [name]: true }));
    const err = validateField(name, (form as any)[name]);
    setErrors(e => ({ ...e, [name]: err }));
  }

  // ── Submit ────────────────────────────────────────────────
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Touch all fields
    setTouched({ brideName:true, groomName:true, email:true, phone:true });
    const errs = validateAll();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true); setServerError("");
    const payload = {
      name:      `${form.brideName.trim()} & ${form.groomName.trim()}`,
      email:     form.email.trim().toLowerCase(),
      whatsapp:  `+94${form.phone}`,
      package:   pkg,
      hasDesignerCard: form.hasDesignerCard,
    };
    const res = await fetch("/api/leads", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) { setServerError(j.error ?? "Submission failed. Please try again."); return; }
    setStep("done");
  }

  // ── Done screen ───────────────────────────────────────────
  if (step === "done") return (
    <div style={{ minHeight:"100vh", background:"var(--ivory)", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
      <div style={{ maxWidth:480, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>💍</div>
        <h2 style={{ fontFamily:"var(--font-display)", fontSize:32, fontWeight:400, marginBottom:12 }}>We've received your request!</h2>
        <p style={{ color:"var(--charcoal-soft)", fontSize:15, lineHeight:1.7, marginBottom:8 }}>
          Thank you, <strong>{form.brideName} & {form.groomName}</strong>!
        </p>
        <p style={{ color:"var(--charcoal-soft)", fontSize:14, lineHeight:1.7, marginBottom:32 }}>
          Our team will contact you on <strong>+94{form.phone}</strong> within one hour to confirm your {pkg.charAt(0)+pkg.slice(1).toLowerCase()} package and arrange payment.
        </p>
        <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", background:"var(--charcoal)", color:"var(--white)", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:500, textDecoration:"none" }}>
          ← Back to home
        </a>
      </div>
    </div>
  );

  const field = (name: keyof Errors, label: string, placeholder: string, type = "text") => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:"block", fontSize:10, letterSpacing:".1em", textTransform:"uppercase", color:"var(--charcoal-soft)", fontWeight:500, marginBottom:6 }}>
        {label} <span style={{ color:"var(--red)", fontSize:12 }}>*</span>
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as any)[name]}
        onChange={e => handleChange(name, e.target.value)}
        onBlur={() => handleBlur(name)}
        style={inputStyle(!!errors[name] && !!touched[name])}
        onFocus={e => { if (!errors[name] || !touched[name]) e.target.style.borderColor = "var(--gold)"; }}
      />
      {errors[name] && touched[name] && (
        <p style={{ fontSize:11, color:"var(--red)", marginTop:5, display:"flex", alignItems:"center", gap:4 }}>
          <span>⚠</span> {errors[name]}
        </p>
      )}
    </div>
  );

  // ── Form screen ───────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"var(--ivory)" }}>
      {/* Header */}
      <div style={{ padding:"20px 48px", borderBottom:"1px solid var(--ivory-border)", display:"flex", alignItems:"center", gap:12 }}>
        <a href="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
          <div style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid var(--charcoal)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>✦</div>
          <span style={{ fontFamily:"var(--font-display)", fontSize:15, color:"var(--charcoal)" }}>Vowly Invites</span>
        </a>
        <span style={{ color:"var(--ivory-border)" }}>·</span>
        <span style={{ fontSize:13, color:"var(--charcoal-mute)" }}>Get Your Invitation</span>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"60px 48px", display:"grid", gridTemplateColumns:"1fr 480px", gap:64, alignItems:"start" }}>
        {/* Left — package selection */}
        <div>
          <p style={{ fontSize:11, letterSpacing:".14em", textTransform:"uppercase", color:"var(--charcoal-mute)", fontWeight:500, marginBottom:12 }}>Choose Your Package</p>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:38, fontWeight:400, color:"var(--charcoal)", marginBottom:32, lineHeight:1.1 }}>
            Your invitation,<br/><em style={{ color:"var(--charcoal-soft)" }}>beautifully delivered.</em>
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {PACKAGES.map(p => (
              <div key={p.id} onClick={() => setPkg(p.id)}
                style={{ padding:"20px 22px", borderRadius:"var(--radius-lg)", border:`2px solid ${pkg===p.id?"var(--charcoal)":"var(--ivory-border)"}`, background:pkg===p.id?"var(--charcoal)":"var(--white)", cursor:"pointer", transition:"all .15s", position:"relative" }}>
                {p.highlight && <div style={{ position:"absolute", top:-10, right:16, background:"var(--gold)", color:"var(--charcoal)", fontSize:10, fontWeight:700, letterSpacing:".08em", padding:"3px 10px", borderRadius:20 }}>MOST POPULAR</div>}
                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:10 }}>
                  <div>
                    <span style={{ fontFamily:"var(--font-display)", fontSize:20, color:pkg===p.id?"var(--white)":"var(--charcoal)" }}>{p.id.charAt(0)+p.id.slice(1).toLowerCase()}</span>
                    <span style={{ fontSize:12, color:pkg===p.id?"rgba(255,255,255,.5)":"var(--charcoal-mute)", marginLeft:8 }}>{p.dur}</span>
                  </div>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:22, color:pkg===p.id?"var(--gold-light)":"var(--charcoal)" }}>{p.price}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {p.features.map(f => (
                    <span key={f} style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:pkg===p.id?"rgba(255,255,255,.1)":"var(--ivory-deep)", color:pkg===p.id?"rgba(255,255,255,.7)":"var(--charcoal-soft)", border:`1px solid ${pkg===p.id?"rgba(255,255,255,.12)":"var(--ivory-border)"}` }}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form card */}
        <div style={{ background:"var(--white)", border:"1px solid var(--ivory-border)", borderRadius:"var(--radius-xl)", padding:"36px 32px", boxShadow:"var(--shadow-md)", position:"sticky", top:24 }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontSize:24, fontWeight:400, marginBottom:4 }}>Reserve your invitation</h3>
          <p style={{ fontSize:13, color:"var(--charcoal-mute)", marginBottom:28, lineHeight:1.6 }}>No payment required now. We'll contact you on WhatsApp within one hour.</p>

          {serverError && (
            <div style={{ padding:"10px 14px", background:"var(--red-pale)", border:"1px solid #fcc", borderRadius:"var(--radius-sm)", fontSize:13, color:"var(--red)", marginBottom:16 }}>
              ⚠ {serverError}
            </div>
          )}

          <form onSubmit={submit} noValidate>
            {/* Names row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {field("brideName", "Bride's Name", "Ishara")}
              {field("groomName", "Groom's Name", "Panchana")}
            </div>

            {field("email", "Email Address", "kasun@example.com", "email")}

            {/* WhatsApp — +94 prefix */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontSize:10, letterSpacing:".1em", textTransform:"uppercase", color:"var(--charcoal-soft)", fontWeight:500, marginBottom:6 }}>
                WhatsApp Number <span style={{ color:"var(--red)", fontSize:12 }}>*</span>
              </label>
              <div style={{
                display:"flex", alignItems:"center",
                border:`1px solid ${errors.phone && touched.phone ? "var(--red)" : "var(--ivory-border)"}`,
                borderRadius:"var(--radius-sm)", overflow:"hidden",
                background: errors.phone && touched.phone ? "var(--red-pale)" : "var(--white)",
                transition:"border-color .15s",
              }}
                onFocus={() => {}} // handled per child
              >
                <div style={{ padding:"11px 12px", background:"var(--ivory-deep)", borderRight:"1px solid var(--ivory-border)", fontSize:13, color:"var(--charcoal-soft)", fontWeight:500, flexShrink:0, whiteSpace:"nowrap" }}>
                  🇱🇰 +94
                </div>
                <input
                  type="tel"
                  placeholder="771234567"
                  value={form.phone}
                  onChange={e => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  maxLength={9}
                  style={{ flex:1, padding:"11px 12px", border:"none", outline:"none", fontSize:13, color:"var(--charcoal)", fontFamily:"var(--font-body)", background:"transparent", letterSpacing:".04em" }}
                  onFocus={e => {
                    const wrap = e.target.parentElement!;
                    if (!errors.phone || !touched.phone) wrap.style.borderColor = "var(--gold)";
                  }}
                />
                {/* Digit counter */}
                <div style={{ padding:"0 12px", fontSize:11, color:form.phone.length===9?"var(--green)":"var(--charcoal-mute)", fontWeight:500, flexShrink:0 }}>
                  {form.phone.length}/9
                </div>
              </div>
              {errors.phone && touched.phone && (
                <p style={{ fontSize:11, color:"var(--red)", marginTop:5, display:"flex", alignItems:"center", gap:4 }}>
                  <span>⚠</span> {errors.phone}
                </p>
              )}
              <p style={{ fontSize:11, color:"var(--charcoal-mute)", marginTop:5 }}>
                Sri Lanka mobile — 9 digits without leading 0 (e.g. 771234567)
              </p>
            </div>

            {/* Designer card checkbox */}
            <div
              onClick={() => setForm(f => ({ ...f, hasDesignerCard: !f.hasDesignerCard }))}
              style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"12px 14px", background:"var(--ivory)", borderRadius:"var(--radius-sm)", border:"1px solid var(--ivory-border)", cursor:"pointer", transition:"border-color .15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--charcoal-mute)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--ivory-border)"}
            >
              <div style={{ width:18, height:18, borderRadius:4, border:"2px solid", borderColor:form.hasDesignerCard?"var(--charcoal)":"var(--ivory-border)", background:form.hasDesignerCard?"var(--charcoal)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}>
                {form.hasDesignerCard && <span style={{ color:"white", fontSize:11 }}>✓</span>}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>I have a print card designer</div>
                <div style={{ fontSize:11, color:"var(--charcoal-mute)" }}>We'll match your digital invitation to your printed card</div>
              </div>
            </div>

            {/* Selected package summary */}
            <div style={{ padding:"12px 14px", background:"var(--gold-pale)", borderRadius:"var(--radius-sm)", border:"1px solid var(--gold-light)", marginBottom:20, fontSize:12, color:"#8B6914", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span><strong>Package:</strong> {pkg.charAt(0)+pkg.slice(1).toLowerCase()}</span>
              <span style={{ fontWeight:600 }}>{PACKAGES.find(p=>p.id===pkg)?.price}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width:"100%", padding:"14px", background:"var(--charcoal)", color:"white", border:"none", borderRadius:"var(--radius-sm)", fontSize:13, fontWeight:500, letterSpacing:".04em", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, fontFamily:"var(--font-body)", opacity:loading?.7:1 }}
            >
              {loading ? "Submitting…" : "SUBMIT REQUEST →"}
            </button>
            <p style={{ textAlign:"center", fontSize:11, color:"var(--charcoal-mute)", marginTop:12 }}>
              No spam. We only contact you about your invitation.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
