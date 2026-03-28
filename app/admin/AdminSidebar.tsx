"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface Props {
  user: { name: string; email: string };
  unreadChat?: number;
  newLeads?: number;
}

const nav = [
  { section: "Platform", items: [
    { href: "/admin",          label: "Overview",        icon: <IconGrid /> },
    { href: "/admin/weddings", label: "Wedding & Couples", icon: <IconHeart /> },
    { href: "/admin/leads",    label: "Leads",           icon: <IconUsers />, badge: "leads" },
    { href: "/admin/chat",     label: "Chat Inbox",      icon: <IconChat />,  badge: "chat" },
  ]},
  { section: "Design", items: [
    { href: "/admin/templates", label: "Templates & Themes", icon: <IconDesign /> },
  ]},
];

export default function AdminSidebar({ user, unreadChat = 0, newLeads = 0 }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="a-sidebar">
      <div className="a-sidebar-brand">
        <div className="a-sidebar-brand-mark">✦</div>
        <span className="a-sidebar-brand-name">Vowly Invites</span>
      </div>

      <nav className="a-sidebar-nav">
        {nav.map(group => (
          <div key={group.section}>
            <div className="a-sidebar-section-label">{group.section}</div>
            <div className="a-sidebar-section-items">
            {group.items.map(item => {
              const active = isActive(item.href);
              const count = (item as any).badge === "chat" ? unreadChat : (item as any).badge === "leads" ? newLeads : 0;
              return (
                <a key={item.href} href={item.href} className={`a-nav-item${active ? " active" : ""}`}>
                  {item.icon}
                  <span className="a-nav-item-label">{item.label}</span>
                  {count > 0 && (
                    <span className={`a-nav-badge${(item as any).badge === "leads" ? " gold" : ""}`}>
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </a>
              );
            })}
            </div>
          </div>
        ))}
      </nav>

      <div className="a-sidebar-user">
        <div className="a-sidebar-user-inner">
          <div className="a-sidebar-avatar">
            {user.name.charAt(0).toUpperCase()}
            <div className="a-sidebar-avatar-dot" />
          </div>
          <div>
            <div className="a-sidebar-user-name">{user.name}</div>
            <div className="a-sidebar-user-email">{user.email}</div>
          </div>
        </div>
        <button className="a-signout-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function IconGrid() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>; }
function IconHeart() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 13.5S1.5 9.5 1.5 5.5a3 3 0 015.3-1.9L8 5l1.2-1.4a3 3 0 015.3 1.9c0 4-6.5 8-6.5 8z"/></svg>; }
function IconUsers() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="12" cy="5" r="2"/><path d="M15 13c0-2.2-1.3-4-3-4.5"/></svg>; }
function IconChat() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l2 2 2-2h5a1 1 0 001-1V3a1 1 0 00-1-1z"/></svg>; }
function IconDesign() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>; }
