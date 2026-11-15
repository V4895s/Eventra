"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";

export default function Nav() {
  const [user, setUser] = useState(null), [unread, setUnread] = useState(0);
  useEffect(() => {
    api("/api/auth/me").then((u) => {
      setUser(u);
      if (u) api("/api/notifications").then((n) => setUnread(n.unread)).catch(() => {});
    }).catch(() => {});
  }, []);
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }); window.location.href = "/"; };
  return (
    <nav>
      <div>
        <Link href="/" className="logo"><i>✦</i> Eventra</Link>
        <div className="links" style={{ padding: 0, height: "auto", flexWrap: "wrap" }}>
          <Link href="/events">Events</Link>
          <Link href="/calendar">Calendar</Link>
          {user && <Link href="/my">My tickets</Link>}
          {user && <Link href="/notifications">Notifications{unread > 0 && <span className="badge">{unread}</span>}</Link>}
          {user && <Link href="/profile">Profile</Link>}
          {user?.role === "admin" && <Link href="/admin">Admin</Link>}
          {user ? <button className="link" onClick={logout}>Sign out</button> : <Link href="/login">Sign in</Link>}
        </div>
      </div>
    </nav>
  );
}
