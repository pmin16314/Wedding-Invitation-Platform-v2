"use client";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { IconGrid, IconUsers, IconCheck, IconPhoto, IconHeart, IconCamera, IconShare, IconChat, IconEdit, IconGear } from "@/components/icons";
interface Props {
  user: { name: string; email: string };
  unreadChat?: number;
  wedding: { slug:string; status:string; brideName:string; groomName:string; primaryColor:string } | null;
}

const nav = [
  { href:"/dashboard",          label:"Overview",   icon:<IconGrid/> },
  { href:"/dashboard/guests",   label:"Guests",     icon:<IconUsers/> },
  { href:"/dashboard/rsvp",     label:"RSVPs",      icon:<IconCheck/> },
  { href:"/dashboard/gallery",  label:"Gallery",    icon:<IconPhoto/> },
  { href:"/dashboard/wishes",   label:"Wishes",     icon:<IconHeart/> },
  { href:"/dashboard/moments",  label:"Moments",    icon:<IconCamera/> },
  { href:"/dashboard/share",    label:"Share",      icon:<IconShare/> },
  { href:"/dashboard/chat",     label:"Support",    icon:<IconChat/>, badge:true },
  { href:"/dashboard/content",  label:"Invitation", icon:<IconEdit/> },
  { href:"/dashboard/settings", label:"Settings",   icon:<IconGear/> },
];

export default function DashboardSidebar({ user, unreadChat=0, wedding }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => href==="/dashboard" ? pathname==="/dashboard" : pathname.startsWith(href);
  const pc = wedding?.primaryColor ?? "#C9A84C";
  const name = wedding?.brideName && wedding?.groomName
    ? `${wedding.brideName} & ${wedding.groomName}` : user.name;
  const initials = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase();

  return (
    <aside className="db-sidebar">
      <div className="db-sidebar-brand">
        <div className="db-sidebar-brand-mark db-brand-mark">✦ VOWLY</div>
        <div className="db-wedding-name">{name}</div>
        {wedding && (
          <div className="db-wedding-status">
            <span className={`db-status-pill ${wedding.status.toLowerCase()}`}>{wedding.status}</span>
            <a href={`/${wedding.slug}`} className="db-view-invite-link" target="_blank">View →</a>
          </div>
        )}
      </div>

      <nav className="db-sidebar-nav">
        {nav.map(item => {
          const active = isActive(item.href);
          const count  = item.badge ? unreadChat : 0;
          return (
            <a key={item.href} href={item.href} className={`db-nav-item${active?" active":""}`}>
              {item.icon}
              <span className="db-nav-item-label">{item.label}</span>
              {count > 0 && <span className="db-nav-badge" style={{background:pc,color:"white"}}>{count>99?"99+":count}</span>}
            </a>
          );
        })}
      </nav>

      <div className="db-sidebar-user">
        <div className="db-user-inner">
          <div className="db-user-avatar" style={{background:pc}}>{initials}</div>
          <div>
            <div className="db-user-name">{user.name}</div>
            <div className="db-user-email">{user.email}</div>
          </div>
        </div>
        <button className="db-signout-btn" onClick={()=>signOut({callbackUrl:"/"})}>Sign out</button>
      </div>
    </aside>
  );
}
