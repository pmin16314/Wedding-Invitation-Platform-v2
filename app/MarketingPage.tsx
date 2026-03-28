"use client";
import { useEffect } from "react";
import "./home.css";

export default function MarketingPage() {
  // Smooth scroll for anchor links — works with sticky nav
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute("href")!.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="home-wrap">
      {/* ── Nav ── */}
      <nav className="home-nav">
        <a href="/" className="home-nav-brand" style={{ textDecoration: "none" }}>
          <span className="home-nav-mark">✦</span>
          <span className="home-nav-name">Vowly Invites</span>
        </a>
        <div className="home-nav-links">
          <a href="#packages" className="home-nav-link">Packages</a>
          <a href="#about"    className="home-nav-link">About</a>
          <a href="/order"    className="home-nav-cta">Get Yours</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero" id="home">
        <div className="home-hero-inner">
          <div className="home-hero-tag fade-up">vowlyinvites.lk · Sri Lanka</div>
          <h1 className="home-hero-title fade-up d1">Digital wedding<br/><em>invitations</em><br/>crafted for you.</h1>
          <p className="home-hero-sub fade-up d2">
            Professional, multi-event digital invitations designed for Sri Lankan weddings.
            Seth Pirith, Poruwa Ceremony, Reception — all in one beautiful page.
          </p>
          <div className="home-hero-actions fade-up d3">
            <a href="/order" className="home-btn-primary">Get This Invitation</a>
            <a href="#packages" className="home-btn-ghost">See packages →</a>
          </div>
        </div>

        {/* Decorative preview card */}
        <div className="home-preview fade-in d4">
          <div className="home-preview-card">
            <div className="home-preview-tag">VOWLY INVITES</div>
            <h2 className="home-preview-names">Ishara<br/><span>&</span><br/>Panchana</h2>
            <div className="home-preview-divider"/>
            <p className="home-preview-date">Saturday, 22 November 2026</p>
            <p className="home-preview-venue">The Grand Garden Hotel<br/>Colombo 03, Sri Lanka</p>
            <div className="home-preview-events">
              <div className="home-preview-event"><span>Seth Pirith</span><span>7:00 PM · Sat 21 Nov</span></div>
              <div className="home-preview-event"><span>Poruwa Ceremony</span><span>9:47 AM ✦</span></div>
              <div className="home-preview-event"><span>Reception</span><span>6:00 PM</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section id="packages" className="home-packages">
        <p className="home-section-tag">Pricing</p>
        <h2 className="home-section-title">Choose your package</h2>
        <div className="home-pkg-grid">
          {[
            { name:"Basic",   price:"3,900",  dur:"3 months",  highlight:false, features:["Common invitation URL","All ceremonial events","10 gallery photos","Scroll animations","24/7 in-app chat"] },
            { name:"Classic", price:"9,900",  dur:"6 months",  highlight:true,  features:["Per-guest token links","Up to 250 guests","WhatsApp sharing","30 gallery photos","Designer assets","Custom theme & fonts","Google Maps embed","Full analytics","CSV export"] },
            { name:"Premium", price:"21,900", dur:"12 months", highlight:false, features:["Unlimited guests","All 7 asset slots","Cinematic intro","Parallax hero","Monogram & crest","Post-wedding page forever"] },
          ].map(pkg => (
            <div key={pkg.name} className={`home-pkg-card${pkg.highlight ? " featured" : ""}`}>
              <div className="home-pkg-name">{pkg.name}</div>
              <div className="home-pkg-price">LKR {pkg.price}</div>
              <div className="home-pkg-dur">{pkg.dur}</div>
              <ul className="home-pkg-features">
                {pkg.features.map(f => <li key={f}><span>✓</span>{f}</li>)}
              </ul>
              <a href={`/order?package=${pkg.name.toUpperCase()}`} className={`home-pkg-btn${pkg.highlight ? " primary" : ""}`}>
                Get {pkg.name}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="home-about">
        <div className="home-about-inner">
          <div className="home-about-text">
            <p className="home-section-tag">About Vowly Invites</p>
            <h2 className="home-section-title" style={{ textAlign:"left", marginBottom:20 }}>Built for Sri Lankan weddings</h2>
            <p className="home-about-para">
              Sri Lankan weddings are unlike any other — multiple ceremonies across two days, auspicious Nekath times, and the warmth of every tradition honoured. No global invitation platform understands that. Vowly Invites was built specifically for the Sri Lankan market.
            </p>
            <p className="home-about-para">
              We handle every detail of the design. You fill in your names, events, and guest list. Within 24 hours of payment, your invitation is live and ready to share — personalised for each guest, with your own colour palette and floral artwork from your print card designer.
            </p>
            <a href="/order" className="home-btn-primary" style={{ display:"inline-flex", marginTop:24 }}>Start your invitation →</a>
          </div>
          <div className="home-about-features">
            {[
              { icon:"✦", title:"We do the design", sub:"Admin configures your template, theme, and designer assets. You never touch a design tool." },
              { icon:"💍", title:"All Sri Lankan events", sub:"Seth Pirith, Poruwa Ceremony, Reception, Homecoming — with Nekath times and individual venues." },
              { icon:"📱", title:"Personalised per guest", sub:"Each guest receives a link with their name. RSVP tracks attendance, headcount, and meal preference." },
              { icon:"🎨", title:"Your print card, digital", sub:"Send us your designer's PNG files — we apply them to your invitation for a matching visual identity." },
              { icon:"💬", title:"24/7 in-app support", sub:"Chat directly with the Vowly team inside your dashboard. No WhatsApp back-and-forth." },
              { icon:"📊", title:"Full analytics", sub:"See who opened the invitation, who has RSVP'd, and export the full guest list to CSV." },
            ].map(({ icon, title, sub }) => (
              <div key={title} className="home-about-feature">
                <div className="home-about-feature-icon">{icon}</div>
                <div>
                  <div className="home-about-feature-title">{title}</div>
                  <div className="home-about-feature-sub">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <a href="/" className="home-footer-brand" style={{ textDecoration:"none" }}>✦ Vowly Invites</a>
        <p className="home-footer-sub">Digital wedding invitations for Sri Lanka · vowlyinvites.lk</p>
        <div className="home-footer-links">
          <a href="#packages" className="home-footer-link">Packages</a>
          <a href="#about"    className="home-footer-link">About</a>
          <a href="/order"    className="home-footer-link">Get Yours</a>
        </div>
      </footer>
    </div>
  );
}
