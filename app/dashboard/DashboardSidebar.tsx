"use client";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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

function IconGrid()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>; }
function IconUsers()  { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/><circle cx="12" cy="5" r="2"/><path d="M15 13c0-2.2-1.3-4-3-4.5"/></svg>; }
function IconCheck()  { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 8l3.5 3.5L13 4"/></svg>; }
function IconPhoto()  { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="3" width="14" height="10" rx="1.5"/><circle cx="8" cy="8" r="2.5"/></svg>; }
function IconHeart()  { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 13.5S1.5 9.5 1.5 5.5a3 3 0 015.3-1.9L8 5l1.2-1.4a3 3 0 015.3 1.9c0 4-6.5 8-6.5 8z"/></svg>; }
function IconCamera() { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 5.5A1.5 1.5 0 012.5 4H4l1-2h6l1 2h1.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5v-7z"/><circle cx="8" cy="9" r="2.5"/></svg>; }
function IconShare()  { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10 2l4 4-4 4M14 6H5a3 3 0 00-3 3v3"/></svg>; }
function IconChat()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l2 2 2-2h5a1 1 0 001-1V3a1 1 0 00-1-1z"/></svg>; }
function IconEdit()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M11 2l3 3-9 9H2v-3l9-9z"/></svg>; }
function IconGear()   { return <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>; }
