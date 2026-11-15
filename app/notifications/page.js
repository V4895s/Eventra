"use client";
import Link from "next/link";
import { api } from "@/lib/client";
import { useData } from "@/lib/useData";

// The database triggers write plain messages; the page turns them into a type and an event title.
const kindOf = (m) => (m.startsWith("A seat opened up") ? "promoted" : m.includes("waitlist") ? "waitlist" : "confirmed");
const titleOf = (m) => m.match(/"(.+)"/)?.[1] || m;
const LABEL = { confirmed: "Registration confirmed", waitlist: "Added to the waitlist", promoted: "A seat opened up. You're in!" };

function Icon({ k }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {k === "confirmed" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
      {k === "waitlist" && (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>)}
      {k === "promoted" && <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8L12 3.5z" />}
    </svg>
  );
}

function ago(s) {
  const d = new Date(String(s).replace(" ", "T"));
  const sec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
  if (sec < 86400) { const h = Math.floor(sec / 3600); return `${h} hour${h > 1 ? "s" : ""} ago`; }
  if (sec < 604800) { const n = Math.floor(sec / 86400); return `${n} day${n > 1 ? "s" : ""} ago`; }
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function Card({ n }) {
  const k = kindOf(n.message);
  return (
    <div className={"nt " + (n.isRead ? "" : "new")}>
      <div className="ic"><Icon k={k} /></div>
      <div>
        <span className="kind">{LABEL[k]}{!n.isRead && <span className="badge">New</span>}</span>
        <h3>{titleOf(n.message)}</h3>
      </div>
      <span className="when">{ago(n.createdAt)}</span>
    </div>
  );
}

export default function Notifications() {
  const { data, err } = useData("/api/notifications");
  if (err === "Please sign in") return <p><Link href="/login">Sign in</Link> to see your notifications.</p>;
  const markRead = async () => { await api("/api/notifications", { method: "PATCH" }); window.location.reload(); };
  const items = data?.items || [];
  const fresh = items.filter((n) => !n.isRead), older = items.filter((n) => n.isRead);
  return (
    <>
      <div className="nt-head">
        <div>
          <h2>Notifications</h2>
          {data && <p className="meta">{fresh.length ? `${fresh.length} new` : "You're all caught up"}</p>}
        </div>
        {fresh.length > 0 && <button className="alt sm" onClick={markRead}>Mark all as read</button>}
      </div>
      {fresh.length > 0 && <><h3 className="nt-group">New</h3>{fresh.map((n) => <Card key={n.id} n={n} />)}</>}
      {older.length > 0 && <><h3 className="nt-group">Earlier</h3>{older.map((n) => <Card key={n.id} n={n} />)}</>}
      {data && !items.length && <div className="nt-empty">No notifications yet. Register for an event and you will see it here.</div>}
    </>
  );
}
