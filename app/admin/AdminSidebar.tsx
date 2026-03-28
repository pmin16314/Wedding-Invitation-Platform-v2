"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { IconGrid, IconHeart, IconUsers, IconChat, IconDesign } from "@/components/icons";
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
