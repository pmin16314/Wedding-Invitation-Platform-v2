"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { IconGrid, IconHeart, IconUsers, IconChat, IconDesign, IconGear } from "@/components/icons";
import SettingsModal from "@/components/SettingsModal";

interface Props {
  user: { name: string; email: string; avatarUrl?: string | null };
  unreadChat?: number;
  newLeads?:   number;
}

const nav = [
  { section: "Platform", items: [
    { href: "/admin",           label: "Overview",          icon: <IconGrid /> },
    { href: "/admin/weddings",  label: "Wedding & Couples", icon: <IconHeart /> },
    { href: "/admin/leads",     label: "Leads",             icon: <IconUsers />, badge: "leads" },
    { href: "/admin/chat",      label: "Chat Inbox",        icon: <IconChat />,  badge: "chat" },
  ]},
  { section: "Design", items: [
    { href: "/admin/templates", label: "Templates & Themes", icon: <IconDesign /> },
  ]},
];

export default function AdminSidebar({ user, unreadChat = 0, newLeads = 0 }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [avatarUrl,    setAvatarUrl]    = useState(user.avatarUrl ?? null);

  const initials = user.name.split(" ").filter(Boolean).map(w => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");

  return (
    <>
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
                  const count  = (item as any).badge === "chat" ? unreadChat : (item as any).badge === "leads" ? newLeads : 0;
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
            <div className="a-sidebar-avatar" onClick={() => setSettingsOpen(true)} style={{ cursor: "pointer" }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={user.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : initials
              }
              <div className="a-sidebar-avatar-dot" />
            </div>
            <div>
              <div className="a-sidebar-user-name">{user.name}</div>
              <div className="a-sidebar-user-email">{user.email}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>            
            <button className="a-signout-btn" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign out
            </button>
            <button className="a-settings-btn" onClick={() => setSettingsOpen(true)} title="Settings">
              <IconGear size={14} />
            </button>
          </div>
        </div>
      </aside>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={{ ...user, avatarUrl }}
        onAvatarChange={url => setAvatarUrl(url)}
        theme="admin"
      />
    </>
  );
}
